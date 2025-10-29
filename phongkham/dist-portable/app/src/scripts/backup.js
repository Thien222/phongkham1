import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function backupDatabase() {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Đường dẫn database
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    
    // Lấy backupPath từ settings (nếu có)
    const backupPathSetting = await prisma.setting.findUnique({
      where: { key: 'backupPath' }
    }).catch(() => null);
    
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
    
    // Tên file backup
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Copy file database
    fs.copyFileSync(dbPath, backupPath);
    
    console.log(`✅ Backup thành công: ${backupFileName}`);
    console.log(`   Đường dẫn: ${backupPath}`);
    console.log(`   Thời gian: ${now.toLocaleString('vi-VN')}`);
    
    // Lấy maxBackups từ settings
    const maxBackupsSetting = await prisma.setting.findUnique({
      where: { key: 'maxBackups' }
    }).catch(() => null);
    const maxBackups = maxBackupsSetting ? parseInt(maxBackupsSetting.value) : 30;
    
    // Dọn dẹp các backup cũ
    cleanOldBackups(backupDir, maxBackups);
    
    return { success: true, path: backupPath, fileName: backupFileName };
  } catch (error) {
    console.error('❌ Backup thất bại:', error);
    return { success: false, error: error.message };
  }
}

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

// Nếu chạy trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase();
}
