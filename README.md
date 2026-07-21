# Gmail Bulk Trash Purger

A lightweight, automated Google Apps Script solution to permanently delete thousands of emails from your Gmail Trash without encountering server timeout errors.

## The Problem (Background)
When your Gmail Trash builds up to thousands of messages (e.g., 5,000 to 10,000+ emails), attempting to use the default web interface option **"Select all conversations in Trash" -> "Delete forever"** frequently fails. 

Because of the massive data payload, Google's servers time out, throwing a generic **"An error occurred"** message. Users are then forced to manually delete emails page-by-page (50 to 100 at a time), which requires repetitive clicking and hours of manual work.

## The Solution
This repository provides a simple, secure Google Apps Script that automates the deletion process. It fetches your trash threads in stable, smaller batches (50 at a time), unpacks the individual messages, and purges them via the official Gmail API. It also includes error handling to safely skip messages that have already been deleted, preventing script crashes.

The complete automated script can be found in the [Code.gs](./Code.gs) file in this repository.

## Prerequisites
Before setting up the script, make sure you have:
* A Google/Gmail account.
* A desktop web browser to access the Google Apps Script console.

## Setup Instructions

### Step 1: Create a New Script Project
1. Open the [Google Apps Script Dashboard](https://google.com).
2. Click the **New Project** button in the top left corner.
3. Rename the project from *Untitled project* to `Gmail Bulk Trash Purger`.

### Step 2: Add the Code
1. Erase any code automatically generated in the editor (`Code.gs`).
2. Copy the full script layout from the [Code.gs](./Code.gs) file in this repository.
3. Paste the code directly into your Google Apps Script editor.

### Step 3: Enable the Gmail API Service
The script utilizes advanced Google services to bypass standard thread limitations.
1. In the left sidebar of the Apps Script editor, click the **+ (Plus sign)** next to **Services**.
2. Scroll down and select **Gmail API**.
3. Keep the identifier as `Gmail` and click **Add**.

### Step 4: Save and Authorize
1. Click the **Save (Floppy Disk icon)** at the top of the editor.
2. Click the **Run (Play button)** icon.
3. A prompt will appear saying authorization is required. Click **Review permissions**.
4. Choose your Gmail account.
5. Google will display an "unverified app" security warning because you are running your own custom script. Click **Advanced** at the bottom, then click **Go to Gmail Bulk Trash Purger (unsafe)**.
6. Click **Allow** on the final screen.

## Execution and Limits
* **Execution Time:** Google Apps Script limits a single execution run to **6 minutes**. If you have an exceptionally massive trash folder, the script may time out before finishing.
* **What to do if it times out:** Simply click the **Run** button again. It will pick up right where it left off until your Trash is completely empty.

## Optional: Automate Daily Maintenance
If you want this script to automatically clean your trash folder every single day so it never builds up again:
1. Click the **Triggers (Alarm Clock icon)** on the left sidebar.
2. Click **Add Trigger** in the bottom right corner.
3. Under *Choose which function to run*, select `autoEmptyTrash`.
4. Under *Select event source*, choose **Time-driven**.
5. Under *Select type of time-based trigger*, choose **Day timer**.
6. Select your preferred time window (e.g., Midnight to 1am) and click **Save**.

## License
This project is open-source and available under the MIT License.
