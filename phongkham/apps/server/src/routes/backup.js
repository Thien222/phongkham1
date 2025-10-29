import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Tạo backup
router.post('/', async (req, res) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Đường dẫn database
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    
    // Lấy backupPath từ settings (nếu có)
    const backupPathSetting = await prisma.setting.findUnique({
      where: { key: 'backupPath' }
    });
    
    // Tạo thư mục backups nếu chưa có
    let backupDir;
    if (backupPathSetting && backupPathSetting.value && backupPathSetting.value.trim()) {
      backupDir = path.resolve(backupPathSetting.value.trim());
    } else {
      backupDir = path.join(__dirname, '../../backups');
    }
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Kiểm tra file database có tồn tại không
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ ok: false, message: 'Database file not found' });
    }
    
    // Tên file backup
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Copy file database
    fs.copyFileSync(dbPath, backupPath);
    
    // Lấy maxBackups từ settings
    const maxBackupsSetting = await prisma.setting.findUnique({
      where: { key: 'maxBackups' }
    });
    const maxBackups = maxBackupsSetting ? parseInt(maxBackupsSetting.value) : 30;
    
    // Dọn dẹp các backup cũ
    cleanOldBackups(backupDir, maxBackups);
    
    res.json({ 
      ok: true, 
      fileName: backupFileName,
      path: backupPath,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Lấy danh sách backups
router.get('/', async (req, res) => {
  try {
    // Lấy backupPath từ settings (nếu có)
    const backupPathSetting = await prisma.setting.findUnique({
      where: { key: 'backupPath' }
    });
    
    let backupDir;
    if (backupPathSetting && backupPathSetting.value && backupPathSetting.value.trim()) {
      backupDir = path.resolve(backupPathSetting.value.trim());
    } else {
      backupDir = path.join(__dirname, '../../backups');
    }
    
    if (!fs.existsSync(backupDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        return {
          fileName: f,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(files);
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Xóa backup
router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Lấy backupPath từ settings (nếu có)
    const backupPathSetting = await prisma.setting.findUnique({
      where: { key: 'backupPath' }
    });
    
    let backupDir;
    if (backupPathSetting && backupPathSetting.value && backupPathSetting.value.trim()) {
      backupDir = path.resolve(backupPathSetting.value.trim());
    } else {
      backupDir = path.join(__dirname, '../../backups');
    }
    
    const filePath = path.join(backupDir, fileName);
    
    // Kiểm tra file có tồn tại và nằm trong thư mục backups
    if (!filePath.startsWith(backupDir) || !fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, message: 'Backup file not found' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ ok: true, message: 'Đã xóa backup' });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Khôi phục backup
router.post('/restore/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Lấy backupPath từ settings (nếu có)
    const backupPathSetting = await prisma.setting.findUnique({
      where: { key: 'backupPath' }
    });
    
    let backupDir;
    if (backupPathSetting && backupPathSetting.value && backupPathSetting.value.trim()) {
      backupDir = path.resolve(backupPathSetting.value.trim());
    } else {
      backupDir = path.join(__dirname, '../../backups');
    }
    
    const backupPath = path.join(backupDir, fileName);
    
    // Kiểm tra file backup có tồn tại
    if (!backupPath.startsWith(backupDir) || !fs.existsSync(backupPath)) {
      return res.status(404).json({ ok: false, message: 'Backup file not found' });
    }
    
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    
    // Tạo backup của database hiện tại trước khi restore
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const preRestoreBackup = path.join(backupDir, `pre-restore-${timestamp}.db`);
    fs.copyFileSync(dbPath, preRestoreBackup);
    
    // Đóng kết nối Prisma trước khi copy file
    await prisma.$disconnect();
    
    // Khôi phục database từ backup
    fs.copyFileSync(backupPath, dbPath);
    
    // Kết nối lại Prisma
    await prisma.$connect();
    
    res.json({ 
      ok: true, 
      message: 'Đã khôi phục database thành công',
      preRestoreBackup: `pre-restore-${timestamp}.db`
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

function cleanOldBackups(backupDir, keepCount) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    // Xóa các backup cũ
    if (files.length > keepCount) {
      const toDelete = files.slice(keepCount);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   Đã xóa backup cũ: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Lỗi khi dọn dẹp backup cũ:', error);
  }
}

export default router;

