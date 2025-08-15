from flask import Flask, jsonify, request
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import pandas as pd
import logging
import requests
import os
import sys
from typing import Dict, Optional

# Suppress numpy warnings at startup
import warnings
warnings.filterwarnings('ignore', message='numpy.dtype size changed')
warnings.filterwarnings('ignore', message='numpy.ufunc size changed')

# --- Configuration ---
# Path to your service account key file
SERVICE_ACCOUNT_FILE = 'credentials.json'
# The ID of your Google Sheet
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
# The name of the sheet containing the data
SHEET_NAME = 'Sheet1'
# The range of data to retrieve
RANGE_NAME = f'{SHEET_NAME}!A:H'

# LLM Configuration (using Google Gemini API)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Set this environment variable
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
GEMINI_MODEL = "gemini-1.5-flash"  # Fast and free model

# --- Logging Configuration ---
def setup_logging():
    """Set up logging configuration that works in containerized environments."""
    # Get log level from environment variable (useful for debugging)
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_level = getattr(logging, log_level, logging.INFO)
    
    # Create formatter for consistent log format
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s [%(name)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Always include console handler (goes to stdout for container logs)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    handlers = [console_handler]
    
    # Try to add file handler if writable directory exists
    # In your Docker setup, /tmp should be writable by the appuser
    log_file_path = None
    possible_log_dirs = ['/tmp', '.']  # Removed /var/log as it's typically not writable for non-root
    
    for log_dir in possible_log_dirs:
        if os.path.exists(log_dir) and os.access(log_dir, os.W_OK):
            log_file_path = os.path.join(log_dir, 'student_summarizer.log')
            try:
                file_handler = logging.FileHandler(log_file_path)
                file_handler.setFormatter(formatter)
                handlers.append(file_handler)
                print(f"Log file will be written to: {log_file_path}")
                break
            except (OSError, PermissionError) as e:
                print(f"Could not create log file at {log_file_path}: {e}")
                continue
    
    if log_file_path is None:
        print("Info: Using console logging only (recommended for containerized environments)")
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        handlers=handlers,
        force=True  # Force reconfiguration if already configured
    )
    
    # Reduce noise from third-party libraries in production
    if log_level > logging.DEBUG:
        logging.getLogger('googleapiclient.discovery').setLevel(logging.WARNING)
        logging.getLogger('google.auth').setLevel(logging.WARNING)
        logging.getLogger('urllib3').setLevel(logging.WARNING)
        logging.getLogger('requests').setLevel(logging.WARNING)

# Set up logging
setup_logging()

# --- Flask App Initialization ---
app = Flask(__name__)


# --- Helper Functions ---
def get_sheet_data():
    """Retrieves data from the Google Sheet."""
    try:
        logging.info("Attempting to retrieve data from Google Sheet.")
        creds = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=['https://www.googleapis.com/auth/spreadsheets.readonly'])
        service = build('sheets', 'v4', credentials=creds)
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                    range=RANGE_NAME).execute()
        values = result.get('values', [])
        logging.info(f"Retrieved {len(values)} rows from Google Sheet.")

        if not values:
            logging.warning("No data found in Google Sheet.")
            return None
        else:
            # Use copy=False and handle data types explicitly to avoid numpy warnings
            df = pd.DataFrame(values[1:], columns=values[0], copy=False)
            # Clean column names by stripping whitespace
            df.columns = df.columns.str.strip()
            # Convert object dtypes to string to avoid numpy issues
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].astype('string')
            logging.info(f"DataFrame columns: {df.columns.tolist()}")
            logging.info(f"DataFrame shape: {df.shape}")
            return df
    except Exception as e:
        logging.error(f"An error occurred while retrieving sheet data: {e}", exc_info=True)
        return None


def call_gemini_llm(prompt: str) -> Optional[str]:
    """Call Google Gemini API for generating summaries."""
    if not GEMINI_API_KEY:
        logging.warning("Gemini API key not set")
        return None
        
    try:
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 800,
                "stopSequences": []
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        # Add API key to URL
        url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    text = candidate["content"]["parts"][0].get("text", "").strip()
                    logging.info("Successfully generated Gemini summary")
                    return text
            logging.warning("Unexpected Gemini API response structure")
            return None
        else:
            logging.error(f"Gemini API error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling Gemini API: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error with Gemini API: {e}")
        return None


def generate_llm_summary(employee_data: Dict) -> str:
    """Generate an enhanced summary for an employee with intellectual disabilities using Gemini LLM."""
    
    # Create a concise, data-driven prompt for Gemini
    prompt_parts = [
        f"You are an employment coach providing a summary for an employee with intellectual disabilities.",
        f"Analyze the following data to provide a concise, accurate, and actionable summary for the employee's manager and school supervisor.",
        f"**Employee:** {employee_data['student_name']}",
        f"**Metrics:**",
        f"- Total Days Worked: {employee_data['total_days_attended']}",
        f"- On-time arrivals: {employee_data['on_time_percentage']}%",
        f"- Tasks without prompts: {employee_data['worked_without_prompts_count']} times"
    ]
    
    if employee_data['behavior_changes']:
        prompt_parts.append(f"**Behavioral Observations:** {', '.join(employee_data['behavior_changes'])}")
        
    if employee_data['other_comments']:
        prompt_parts.append(f"**Manager's Comments:** {', '.join(employee_data['other_comments'])}")
        
    prompt_parts.append("")
    prompt_parts.append("Provide a summary with these sections:")
    prompt_parts.append("1. **Overall Performance:** A brief, factual overview.")
    prompt_parts.append("2. **Strengths:** Key areas of success.")
    prompt_parts.append("3. **Growth Areas:** Specific, actionable points for improvement.")
    prompt_parts.append("4. **Recommendations:** Practical advice for the manager and supervisor.")
    
    prompt = "\n".join(prompt_parts)

    llm_response = call_gemini_llm(prompt)
    
    if llm_response:
        logging.info("Successfully generated Gemini summary for employee")
        return llm_response
    else:
        logging.warning("Gemini API unavailable, generating basic summary")
        return generate_basic_summary(employee_data)

def generate_basic_summary(employee_data: Dict) -> str:
    """Generate a basic, data-focused summary when LLM is not available."""
    
    on_time_status = "good" if employee_data['on_time_percentage'] >= 85 else "needs focus"
    independence_status = "strong" if employee_data['worked_without_prompts_count'] >= 5 else "developing"
    
    summary = f"""
    Employee Performance Summary for {employee_data['student_name']}:
    
    Based on weekly feedback, {employee_data['student_name']} has worked for a total of {employee_data['total_days_attended']} days.
    Punctuality is {on_time_status} with an on-time rate of {employee_data['on_time_percentage']}%.
    The employee demonstrated a {independence_status} level of independence, initiating tasks without prompts {employee_data['worked_without_prompts_count']} times.
    """
    
    if employee_data['behavior_changes']:
        summary += f"\n\nNoted behavioral changes include: {', '.join(employee_data['behavior_changes'][:3])}."
    
    if employee_data['other_comments']:
        summary += f"\n\nAdditional manager observations: {', '.join(employee_data['other_comments'])}."
    
    return summary.strip()

def summarize_student_data(df, student_name):
    """Generates a summary for a specific student with LLM enhancement."""
    logging.info(f"Summarizing data for student: {student_name}")
    if df is None or df.empty:
        logging.warning("No data found in the Google Sheet.")
        return {"error": "No data found in the Google Sheet."}

    # --- Check for required columns ---
    required_columns = [
        'Student Name', 'Number of days attended this week',
        'On time?', 'Worked without prompts', 'Change in behaviour noted?',
        'If yes, mention that behaviour', 'Any other comments?'
    ]
    
    # Accept either 'Date' or 'Timestamp' as the date column
    date_column = None
    if 'Date' in df.columns:
        date_column = 'Date'
    elif 'Timestamp' in df.columns:
        date_column = 'Timestamp'
    else:
        missing_columns = ['Date or Timestamp'] + [col for col in required_columns if col not in df.columns]
        logging.error(f"Missing columns in sheet: {missing_columns}")
        return {"error": f"Missing columns in sheet: {missing_columns}"}

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        logging.error(f"Missing columns in sheet: {missing_columns}")
        return {"error": f"Missing columns in sheet: {missing_columns}"}

    # Filter data for the specified student (case-insensitive)
    # Use .copy() to avoid pandas warnings
    student_df = df[df['Student Name'].str.lower() == student_name.lower()].copy()
    logging.info(f"Filtered student_df shape: {student_df.shape}")

    if student_df.empty:
        logging.warning(f"No data found for student: {student_name}")
        return {"error": f"No data found for student: {student_name}"}

    # Convert date column to datetime objects with multiple format attempts
    date_formats = ['%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']
    
    for fmt in date_formats:
        try:
            student_df[date_column] = pd.to_datetime(student_df[date_column], format=fmt, errors='coerce')
            break
        except:
            continue
    
    # If all formats failed, try automatic parsing
    if student_df[date_column].isnull().all():
        student_df[date_column] = pd.to_datetime(student_df[date_column], errors='coerce')
    
    logging.info(f"Converted '{date_column}' column to datetime. Null dates: {student_df[date_column].isnull().sum()}")

    # Filter data for the last three months
    three_months_ago = datetime.now() - timedelta(days=90)
    recent_df = student_df[student_df[date_column] >= three_months_ago]
    logging.info(f"Recent_df shape (last 3 months): {recent_df.shape}")

    if recent_df.empty:
        logging.info(f"No recent data (last 3 months) for student: {student_name}")
        return {"message": f"No recent data (last 3 months) for student: {student_name}"}

    # Calculate summary statistics
    try:
        # Use pandas nullable integer dtype to handle NaN values properly
        days_attended_series = pd.to_numeric(recent_df['Number of days attended this week'], errors='coerce').fillna(0)
        total_days_attended = days_attended_series.sum()
    except:
        total_days_attended = 0
        
    on_time_count = recent_df[recent_df['On time?'].str.lower().str.strip() == 'yes'].shape[0]
    total_weeks = len(recent_df)
    on_time_percentage = (on_time_count / total_weeks) * 100 if total_weeks > 0 else 0
    worked_without_prompts = recent_df[recent_df['Worked without prompts'].str.lower().str.strip() == 'yes'].shape[0]
    
    # Consolidate qualitative data - handle potential NaN values
    behavior_mask = recent_df['Change in behaviour noted?'].str.lower().str.strip() == 'yes'
    behavior_changes = recent_df[behavior_mask]['If yes, mention that behaviour'].dropna().unique().tolist()
    
    other_comments = recent_df['Any other comments?'].dropna().unique().tolist()
    # Remove empty strings and whitespace-only comments
    other_comments = [comment.strip() for comment in other_comments if comment.strip()]

    logging.info(f"Summary stats: total_days_attended={total_days_attended}, on_time_percentage={on_time_percentage}, worked_without_prompts_count={worked_without_prompts}")

    # Create structured data for LLM processing
    structured_summary = {
        "student_name": student_name,
        "summary_period": {
            "start_date": three_months_ago.strftime('%Y-%m-%d'),
            "end_date": datetime.now().strftime('%Y-%m-%d')
        },
        "total_days_attended": int(total_days_attended),
        "on_time_percentage": round(float(on_time_percentage), 2),
        "worked_without_prompts_count": int(worked_without_prompts),
        "total_weeks_recorded": total_weeks,
        "behavior_changes": behavior_changes,
        "other_comments": other_comments
    }

    # Generate LLM-enhanced summary
    try:
        llm_summary = generate_llm_summary(structured_summary)
        structured_summary["ai_generated_summary"] = llm_summary
    except Exception as e:
        logging.error(f"Error generating LLM summary: {e}")
        structured_summary["ai_generated_summary"] = generate_basic_summary(structured_summary)

    logging.info(f"Generated enhanced summary for student: {student_name}")
    return structured_summary


# --- API Routes ---
@app.route('/student_summary', methods=['GET'])
def get_student_summary():
    """API endpoint to get a student's enhanced summary."""
    student_name = request.args.get('student_name')
    logging.info(f"Received request for student summary: student_name={student_name}")
    
    if not student_name:
        logging.warning("No 'student_name' parameter provided in request.")
        return jsonify({"error": "Please provide a 'student_name' parameter."}), 400

    df = get_sheet_data()
    summary = summarize_student_data(df, student_name)
    
    if "error" in summary:
        logging.warning(f"Error in summary response: {summary}")
        return jsonify(summary), 404
    else:
        logging.info(f"Returning enhanced summary response for student: {student_name}")
        return jsonify(summary)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint optimized for Choreo."""
    try:
        # Basic health check
        status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "student-summarizer"
        }
        
        # Optional: Add Google Sheets connectivity check
        # Uncomment if you want health check to verify Google Sheets access
        # try:
        #     df = get_sheet_data()
        #     status["google_sheets"] = "connected" if df is not None else "disconnected"
        # except:
        #     status["google_sheets"] = "error"
        
        # Optional: Add Gemini API status
        status["gemini_configured"] = bool(GEMINI_API_KEY)
        
        return jsonify(status), 200
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }), 503


@app.route('/llm_status', methods=['GET'])
def llm_status():
    """Check the status of Gemini API service."""
    status = {
        "gemini": {
            "configured": bool(GEMINI_API_KEY),
            "available": False,
            "model": GEMINI_MODEL
        }
    }
    
    # Test Gemini connection with a simple prompt
    if GEMINI_API_KEY:
        try:
            test_response = call_gemini_llm("Test connection. Respond with 'OK'.")
            if test_response and "ok" in test_response.lower():
                status["gemini"]["available"] = True
        except:
            pass
    
    return jsonify(status)


# --- Main Execution ---
if __name__ == '__main__':
    logging.info("Starting Enhanced Student Summary API with Gemini LLM")
    logging.info(f"Gemini Configuration - Model: {GEMINI_MODEL}")
    logging.info(f"Gemini API configured: {bool(GEMINI_API_KEY)}")
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=False, host='0.0.0.0', port=port)