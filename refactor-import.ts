import fs from 'fs';
import path from 'path';

function findFiles(dir: string, extension: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, extension, fileList);
    } else if (filePath.endsWith(extension)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('./src', '.ts').concat(findFiles('./src', '.tsx'));
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("import { supabase } from '@/lib/supabase'")) {
    content = content.replace(
      /import \{ supabase \} from '@\/lib\/supabase';?\n?/g,
      "import { supabaseAdmin as supabase } from '@/lib/supabase/admin';\n"
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
}

console.log(`Replaced supabase import in ${count} files.`);
