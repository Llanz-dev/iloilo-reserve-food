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

const moveImageToNewDirectory = async (oldPath, newPath) => {
  try {
      await fs.promises.rename(oldPath, newPath);
      console.log('Image moved successfully.');
  } catch (error) {
      console.error('Error moving image:', error);
  }
};


export { deleteDirectory, renameFolder, createDirectory, deleteFile, moveImageToNewDirectory };
