import util from 'util';
import fs from 'fs';
import path from 'path';

const deleteDirectory = (path) => {
  fs.rm(path, { recursive: true }, (err) => {
    if (err) {
    console.error('Error deleting old directory:', err);
    return;
    }
    console.log('Directory deleted successfully:', path);
  });
}

const replaceImagePath = (currPath, oldImageName, newImageName) => {
    return currPath.replace(oldImageName, newImageName);
}

const renameAndDeleteOldFolder = (oldPath, newPath) => {
  // Rename the existing directory to the new path
  fs.rename(oldPath, newPath, (err) => {
      if (err) {
          console.error(err);
          return; // Return early if there's an error
      }
      console.log('Directory renamed successfully:', oldPath, 'to', newPath);
  });
};

export { deleteDirectory, replaceImagePath, renameAndDeleteOldFolder };
