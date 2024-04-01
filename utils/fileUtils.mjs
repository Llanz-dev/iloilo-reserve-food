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
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

const createDirectory = (destinationPath) => {
  fs.mkdirSync(destinationPath, { recursive: true });
}

const deleteFile = (filePathToDelete) => { 
  fs.unlink(filePathToDelete, (unlinkErr) => {
    if (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
        return;
    }          
  });
}
export { deleteDirectory, renameFolder, createDirectory, deleteFile };
