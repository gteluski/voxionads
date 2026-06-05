import fs from 'fs';
import path from 'path';

function findFiles(dir: string, extension: string, fileList: string[] = []) {
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

  // Replace next-auth imports
  if (content.includes("import { getServerSession } from 'next-auth'")) {
    content = content.replace(
      "import { getServerSession } from 'next-auth';",
      "import { createClient } from '@/lib/supabase/server';"
    );
    changed = true;
  }

  // Remove authOptions import
  if (content.includes("import { authOptions } from '@/lib/auth'")) {
    content = content.replace(/import \{ authOptions \} from '@\/lib\/auth';?\n?/, '');
    changed = true;
  }

  // Replace getServerSession call
  if (content.includes("await getServerSession(authOptions)")) {
    content = content.replace(
      /const session = await getServerSession\(authOptions\);?/g,
      "const supabase = createClient();\n  const { data: { user } } = await supabase.auth.getUser();\n  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;"
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
}

console.log(`Refactored ${count} files.`);
