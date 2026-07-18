# MongoDB Atlas Setup Guide

This guide details how to set up a free MongoDB Atlas cluster and connect it to SkillSync for both development and production.

## 1. Create a Free M0 Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account.
2. Click **Build a Database** and select the **M0 Free** cluster.
3. Choose a provider (AWS, Google Cloud, or Azure) and a region closest to your users.
4. Click **Create Cluster**.

## 2. Configure Database Users
1. In the left sidebar under **Security**, click **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** for authentication.
4. Set a strong username (e.g., `skillsync_admin`) and auto-generate a secure password. Save this password securely.
5. Under Database User Privileges, select **Read and write to any database**.
6. Click **Add User**.

## 3. Configure Network Access
To allow the application to connect to the database, you must configure network access.

1. Under **Security**, click **Network Access**.
2. Click **Add IP Address**.
3. **For Development:** 
   - Click **Allow Access from Anywhere**. 
   - This sets the IP to `0.0.0.0/0`. This is necessary if you have a dynamic IP or work from multiple locations.
4. **For Production (Vercel):**
   - Vercel uses dynamic IP addresses, so you must either keep `0.0.0.0/0` (secured by strong credentials) or configure a VPC peering connection (requires paid cluster). For the free tier, `0.0.0.0/0` is the standard approach.

## 4. Get Your Connection String
1. Go to **Database** in the sidebar.
2. Click **Connect** on your cluster.
3. Choose **Drivers**.
4. Select **Node.js** and version **5.5 or later**.
5. Copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

## 5. Configure Environment Variables
In your local SkillSync project, open `.env.local` and paste your connection string. 

> [!CAUTION]
> Remember to replace `<username>` and `<password>` with the credentials you created in step 2. Make sure there are no special characters in your password that might break the URI format (if so, URL-encode them).

```env
# Development database
MONGODB_URI=mongodb+srv://skillsync_admin:YourSecurePassword@cluster0.abcde.mongodb.net/skillsync_dev?retryWrites=true&w=majority

# Recommended: Use a separate DEV and PROD database.
```

> [!TIP] 
> Run the seed script (`npm run seed`) using a separate DEV database (`skillsync_dev`) to ensure you never accidentally overwrite or delete production data.

## 6. Enable Atlas Search (Crucial for SkillSync)
SkillSync utilizes MongoDB `$text` search in its `/api/search` endpoints. While standard text indexes work out of the box (created by our `scripts/create-indexes.ts` script), you can dramatically improve search relevancy, typo tolerance, and fuzzy matching by upgrading to **Atlas Search**.

1. In Atlas, click the **Search** tab.
2. Click **Create Search Index**.
3. Select **Visual Editor**.
4. Set the index name to `default` and select the `users` and `projects` collections.
5. Use the default dynamic mapping, which automatically indexes all string fields.

## 7. Automated Backups
The free M0 tier provides basic snapshots, but for production, consider upgrading to an M10 cluster to enable continuous automated backups and point-in-time recovery.
