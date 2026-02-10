# Google-Sheets-Supabase-Near-Real-Time-Sync
**1.Project Description**

A robust, automated bi-directional synchronization system that seamlessly connects Google Sheets with a Supabase PostgreSQL database for managing employee contact information.

This system ensures:

- Data consistency across both platforms

- Near real-time synchronization

- Strong data integrity

- Comprehensive logging and error handling

**What the Project Does**

Automatically keeps employee contact data in Google Sheets and Supabase database in sync.

Handles new entries, updates, and conflicts automatically.

Keeps a log of all sync operations for tracking errors.

**Key Features**

- Two-way sync: Updates in Sheets go to Supabase, and DB updates go back to Sheets.

- Real-time updates: Changes are synced every 5 minutes.

- Unique IDs: Every employee has a UUID to prevent duplicates.

- Error logging: All failed syncs are recorded for troubleshooting.

- Conflict handling: Sheet or DB data overwrites based on the latest timestamp.

- Data validation: Ensures email, name, and phone are valid before syncing.

- Secure access: Uses Google OAuth 2.0 and Supabase JWT keys.

  **How It Works**

1- Read new or updated rows from Google Sheets.

2- Validate and clean the data.

3- Insert or update records in Supabase using email as a unique key.

4- Pull updated records from Supabase and write back to Sheets.

5- Log every sync operation in a dedicated table (sync_logs).

**Tech Stack**

- Google Sheets API – Read and write spreadsheet data.

- Supabase PostgreSQL – Store and manage employee records.

- Supabase Edge Functions – Execute sync logic automatically.

- pg_cron – Schedule automatic sync every 5 minutes.

- Apps Script – Connect Sheets with Supabase via API calls.

  **Database Structure**

- employee_contacts: Stores employee info with UUID, email, name, phone, timestamps.

- sync_logs: Tracks every sync with status, timestamp, and errors.

  **Security**

- Access to Sheets and DB is restricted and secure.

- Uses Google Service Account + Supabase JWT for authentication.

- Data is encrypted in transit and at rest.

  **Benefits**

- Saves time by automating manual updates.

- Reduces errors with validation and conflict resolution.

- Keeps a full history of all operations for auditing.

- Works continuously without manual intervention.




