# MongoDB Self-Hosted VPS Setup Guide

## Overview
This guide will help you set up MongoDB on your Hostinger VPS (Ubuntu 24.04) and connect your CrickBet application to it.

**VPS Details:**
- IP: 72.62.196.197
- OS: Ubuntu 24.04
- Location: Malaysia - Kuala Lumpur
- RAM: 4% usage (plenty available)
- Storage: 4 GB / 200 GB

---

## Step 1: Connect to Your VPS

Open your terminal and connect via SSH:

```bash
ssh root@72.62.196.197
```

Enter your root password when prompted.

---

## Step 2: Update System Packages

Always update your system first:

```bash
sudo apt update && sudo apt upgrade -y
```

This may take a few minutes.

---

## Step 3: Install MongoDB

### 3.1. Import MongoDB GPG Key

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
```

### 3.2. Add MongoDB Repository

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

### 3.3. Update Package List

```bash
sudo apt update
```

### 3.4. Install MongoDB

```bash
sudo apt install -y mongodb-org
```

---

## Step 4: Start MongoDB

### 4.1. Start the MongoDB Service

```bash
sudo systemctl start mongod
```

### 4.2. Enable MongoDB to Start on Boot

```bash
sudo systemctl enable mongod
```

### 4.3. Check MongoDB Status

```bash
sudo systemctl status mongod
```

You should see "active (running)" in green.

---

## Step 5: Create MongoDB Users and Secure Database

### 5.1. Open MongoDB Shell

```bash
mongosh
```

You should see the MongoDB shell prompt: `test>`

### 5.2. Create Admin User

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "YourStrongPassword123!",  // ⚠️ CHANGE THIS TO A STRONG PASSWORD
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
```

You should see: `{ ok: 1 }`

### 5.3. Create Database and Application User

```javascript
use crickbet
db.createUser({
  user: "crickbet_user",
  pwd: "YourAppPassword123!",  // ⚠️ CHANGE THIS TO A STRONG PASSWORD
  roles: [ { role: "readWrite", db: "crickbet" } ]
})
```

You should see: `{ ok: 1 }`

### 5.4. Exit MongoDB Shell

```javascript
exit
```

---

## Step 6: Enable Authentication

### 6.1. Edit MongoDB Configuration File

```bash
sudo nano /etc/mongod.conf
```

### 6.2. Find and Modify Security Section

Scroll down to find the `#security:` line and change it to:

```yaml
security:
  authorization: enabled
```

**Note:** Make sure there are NO spaces before `security:` and TWO spaces before `authorization:`

### 6.3. Modify Network Settings

Find the `net:` section and update it:

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1,72.62.196.197
```

**Note:** Keep the same indentation (2 spaces)

### 6.4. Save and Exit

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### 6.5. Restart MongoDB

```bash
sudo systemctl restart mongod
```

### 6.6. Verify MongoDB is Running

```bash
sudo systemctl status mongod
```

---

## Step 7: Configure Firewall

### 7.1. Check if UFW is Installed

```bash
sudo ufw status
```

If not installed:

```bash
sudo apt install ufw -y
```

### 7.2. Configure Firewall Rules

**Important:** Before enabling UFW, make sure SSH is allowed:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 7.3. Allow MongoDB Port

**Option A: Allow from specific IP (More Secure)**
```bash
sudo ufw allow from YOUR_LOCAL_IP to any port 27017
```

Replace `YOUR_LOCAL_IP` with your actual local IP address.

**Option B: Allow from anywhere (Less Secure, easier for testing)**
```bash
sudo ufw allow 27017/tcp
```

### 7.4. Enable Firewall

```bash
sudo ufw enable
```

Press `Y` when prompted.

### 7.5. Check Firewall Status

```bash
sudo ufw status
```

---

## Step 8: Test MongoDB Connection from VPS

### 8.1. Test Local Connection

```bash
mongosh "mongodb://crickbet_user:YourAppPassword123!@localhost:27017/crickbet?authSource=crickbet"
```

Replace `YourAppPassword123!` with your actual password.

### 8.2. Run a Test Command

```javascript
db.test.insertOne({ message: "Hello from MongoDB!" })
db.test.find()
exit
```

---

## Step 9: Configure Your Application

### 9.1. Create .env File (on your local machine)

In your `backend` folder, create a `.env` file:

```bash
cd /Users/abdulraheem/Desktop/Freelancing/betting\ website/crickbet/crickbet/backend
cp .env.example .env
```

### 9.2. Edit .env File

Open `.env` and update the MongoDB connection string:

```bash
MONGODB_URI=mongodb://crickbet_user:YourAppPassword123!@72.62.196.197:27017/crickbet?authSource=crickbet
```

**Replace:**
- `YourAppPassword123!` with your actual password from Step 5.3

### 9.3. Update Other Environment Variables

```bash
NODE_ENV=production
JWT_SECRET=generate-a-very-long-random-string-here
CORS_ORIGIN=http://your-frontend-domain.com
```

---

## Step 10: Test Connection from Your Application

### 10.1. Start Your Backend Server

```bash
cd /Users/abdulraheem/Desktop/Freelancing/betting\ website/crickbet/crickbet/backend
npm start
```

### 10.2. Check Logs

You should see:
```
✅ MongoDB Connected: 72.62.196.197
```

---

## Important Security Notes

### 🔒 Security Best Practices

1. **Strong Passwords**: Always use strong, unique passwords for MongoDB users
2. **Firewall**: Only allow MongoDB port (27017) from trusted IPs
3. **SSH Keys**: Consider using SSH keys instead of passwords for VPS access
4. **Regular Backups**: Set up automated backups of your MongoDB database
5. **SSL/TLS**: For production, enable SSL/TLS encryption
6. **Update Regularly**: Keep MongoDB and Ubuntu updated

### 🔑 Password Management

**NEVER** commit your `.env` file to Git. It should be in your `.gitignore`:

```bash
echo ".env" >> backend/.gitignore
```

---

## Troubleshooting

### Issue: Cannot Connect to MongoDB

**Check if MongoDB is running:**
```bash
sudo systemctl status mongod
```

**Check MongoDB logs:**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

**Restart MongoDB:**
```bash
sudo systemctl restart mongod
```

### Issue: Authentication Failed

**Check your username and password in the connection string**

**Test connection manually:**
```bash
mongosh "mongodb://crickbet_user:YOUR_PASSWORD@72.62.196.197:27017/crickbet?authSource=crickbet"
```

### Issue: Connection Timeout

**Check firewall:**
```bash
sudo ufw status
```

**Check if MongoDB is listening on the correct IP:**
```bash
sudo netstat -tulpn | grep 27017
```

### Issue: Port Already in Use

**Check what's using port 27017:**
```bash
sudo lsof -i :27017
```

---

## MongoDB Backup (Important!)

### Create a Backup

```bash
mongodump --uri="mongodb://crickbet_user:YourAppPassword123!@localhost:27017/crickbet?authSource=crickbet" --out=/root/backups/mongodb-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
mongorestore --uri="mongodb://crickbet_user:YourAppPassword123!@localhost:27017/crickbet?authSource=crickbet" /root/backups/mongodb-backup-20260115/crickbet
```

### Automate Backups (Cron Job)

```bash
sudo crontab -e
```

Add this line to backup daily at 2 AM:
```bash
0 2 * * * mongodump --uri="mongodb://crickbet_user:YourAppPassword123!@localhost:27017/crickbet?authSource=crickbet" --out=/root/backups/mongodb-backup-$(date +\%Y\%m\%d) >> /var/log/mongodb-backup.log 2>&1
```

---

## Monitoring MongoDB

### Check MongoDB Status

```bash
mongosh "mongodb://crickbet_user:YourAppPassword123!@localhost:27017/crickbet?authSource=crickbet"
```

```javascript
db.serverStatus()
db.stats()
exit
```

### Monitor Resource Usage

```bash
htop
```

Press `q` to quit.

---

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Test connection from your application
3. ✅ Set up automated backups
4. ✅ Configure SSL/TLS for production (optional but recommended)
5. ✅ Set up monitoring alerts
6. ✅ Document your credentials securely (use a password manager)

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `sudo systemctl start mongod` | Start MongoDB |
| `sudo systemctl stop mongod` | Stop MongoDB |
| `sudo systemctl restart mongod` | Restart MongoDB |
| `sudo systemctl status mongod` | Check MongoDB status |
| `mongosh` | Open MongoDB shell |
| `sudo tail -f /var/log/mongodb/mongod.log` | View MongoDB logs |
| `sudo ufw status` | Check firewall status |

---

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
3. Verify your connection string in `.env` file
4. Ensure firewall allows port 27017

---

**Created:** January 15, 2026
**VPS:** Hostinger - Malaysia (Kuala Lumpur)
**MongoDB Version:** 7.0
**OS:** Ubuntu 24.04
