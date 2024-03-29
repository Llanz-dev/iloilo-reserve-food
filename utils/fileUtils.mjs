import util from 'util';
import fs from 'fs';
import path from 'path';

const deleteDirectory = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.rm(filePath, { recursive: true }, (err) => {
      if (err) {
      console.error('Error deleting old directory:', err);
      return;
      }
      console.log('Directory deleted successfully:', filePath);
    });
  }
}

const renameFolder = (oldPath, newPath) => {
  console.log('oldPath:', oldPath);
  console.log('newPath:', newPath);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

const renameAndDeleteOldFolder = (oldPath, newPath) => {
  if (fs.existsSync(oldPath)) {
    const oldRestaurantFolderPath = path.dirname(path.dirname(oldPath));
    console.log('oldPath:', oldPath);
    console.log('newPath:', newPath);
    renameFolder(oldPath, newPath);
  }
};

// fs.unlink(oldPath, (unlinkErr) => {
//   if (unlinkErr) {
//     console.error('Error deleting file:', unlinkErr);
//     return;
//   }
//   console.log('File deleted successfully:', oldPath);
// });

export { deleteDirectory, renameFolder, renameAndDeleteOldFolder };
