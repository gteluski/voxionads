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

  // Replace client imports
  if (content.includes("@/lib/supabase/client")) {
    content = content.replace(/@\/lib\/supabase\/client/g, "@/utils/supabase/client");
    changed = true;
  }

  // Replace server imports
  if (content.includes("@/lib/supabase/server")) {
    content = content.replace(/@\/lib\/supabase\/server/g, "@/utils/supabase/server");
    // Also need to add next/headers import if not present, and update createClient() to createClient(cookies())
    if (content.includes("createClient()")) {
      content = content.replace(/createClient\(\)/g, "createClient(cookies())");
      if (!content.includes("from 'next/headers'")) {
        content = "import { cookies } from 'next/headers';\n" + content;
      }
    }
    changed = true;
  }

  // Replace admin imports (which replaced the old '@/lib/supabase')
  if (content.includes("@/lib/supabase/admin")) {
    // If they provided standard boilerplates, they might not have provided the admin one, but I'll keep the admin one in lib/supabase/admin for now,
    // actually, let's keep it there since it's just `supabaseAdmin` bypassing RLS. 
    // Wait, the new url and key are PUBLISHABLE_KEY. The service role key wasn't updated!
  }

  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
}

// Update src/middleware.ts manually
const mwPath = './src/middleware.ts';
if (fs.existsSync(mwPath)) {
    let mwContent = fs.readFileSync(mwPath, 'utf8');
    if (mwContent.includes("@/lib/supabase/middleware")) {
        mwContent = mwContent.replace(/@\/lib\/supabase\/middleware/g, "@/utils/supabase/middleware");
        fs.writeFileSync(mwPath, mwContent);
        console.log("Updated src/middleware.ts");
    }
}

console.log(`Replaced supabase imports in ${count} files.`);
