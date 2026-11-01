import type { Photo, Settings } from '../store';
import { uploadImage } from './image-pipeline';
export function processFile(file:File,settings:Settings['img']){return uploadImage(file,settings,'galeria',file.name);}
export type { Photo };
