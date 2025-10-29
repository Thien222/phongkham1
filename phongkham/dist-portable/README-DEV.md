# Phòng Khám Mắt - Portable Edition

## ✅ Package Structure

```
dist-portable/
├── START.bat                    # Main launcher (DOUBLE-CLICK THIS!)
├── nodejs/
│   └── node.exe                # Portable Node.js runtime (85MB)
├── app/                         # Application source
│   ├── src/                    # Source code
│   ├── prisma/                 # Database schema
│   ├── node_modules/           # Dependencies
│   ├── client-dist/            # Frontend build
│   ├── .env                    # Configuration
│   └── package.json            # App metadata
├── data/
│   └── dev.db                  # SQLite database
├── backups/                     # Auto-backup directory
├── HUONG-DAN-SU-DUNG.txt       # User guide (Vietnamese)
└── README-DEV.md               # This file

```

## 🚀 How It Works

1. User double-clicks `START.bat`
2. Batch file runs: `nodejs\node.exe app\src\index.js`
3. Server starts on port 4000
4. Users access via browser: `http://localhost:4000` or `http://<server-ip>:4000`

## ✅ Features

- ✅ No Node.js installation required
- ✅ No IDE required
- ✅ Portable - copy folder to any Windows PC
- ✅ Auto-backup every 4 hours
- ✅ Admin/User role-based access
- ✅ Complete clinic management system

## 📦 Default Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Change password after first login!**

## 🔧 Technical Details

- **Node.js:** v24.11.0 (portable)
- **Database:** SQLite (file-based)
- **Backend:** Express.js + Prisma ORM
- **Frontend:** React + Vite (pre-built)
- **Port:** 4000 (configurable in app/.env)

## 📝 Configuration

Edit `app/.env` to change settings:

```env
PORT=4000
DATABASE_URL=file:../data/dev.db
MONGO_URI=
NODE_ENV=production
```

## 🎯 Distribution

To distribute to users:
1. Zip the entire `dist-portable` folder
2. Send to user
3. User extracts and runs `START.bat`

**Package size:** ~150-200MB (with all dependencies)

## 🐛 Troubleshooting

### Server won't start
- Check if port 4000 is already in use
- Run START.bat as Administrator
- Check Windows Firewall settings

### Database errors
- Ensure `data/dev.db` exists
- Check `.env` DATABASE_URL path
- Restore from `backups/` folder

### "Cannot find module" errors
- Delete `app/node_modules`
- Delete `app/.prisma`
- Re-run START.bat (it will reinstall)

## 📞 Support

- GitHub: https://github.com/Thien222/phongkham1
- Issues: https://github.com/Thien222/phongkham1/issues

---

**Built with ❤️ by Thien222**
**Version:** 1.0.0 Portable Edition
**Date:** October 30, 2025

