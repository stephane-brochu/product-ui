// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// @ts-expect-error JavaScript consumer API
import { install } from "../scripts/consume.mjs";
let directory:string;
beforeEach(async()=>{directory=await fs.mkdtemp(path.join(os.tmpdir(),"product-ui-v7-"));});
afterEach(async()=>{await fs.rm(directory,{recursive:true,force:true});});
const release=path.resolve(".registry-preview/v0.7.0");
it("keeps core at29 files and creation optional",async()=>{
 const lock=await install({project:directory,version:"0.7.0",release});expect(lock.files).toHaveLength(29);expect(lock.dependencies).toEqual({});expect(lock.files.some((file:{target:string})=>file.target.includes("creatable"))).toBe(false);
});
it("installs creation independently with only the existing Popover dependency",async()=>{
 await fs.writeFile(path.join(directory,"package.json"),JSON.stringify({dependencies:{"@radix-ui/react-popover":"1.3.1"}}));
 const lock=await install({project:directory,version:"0.7.0",release,items:"creatable-select"});expect(lock.dependencies).toEqual({"@radix-ui/react-popover":"1.3.1"});expect(lock.files.some((file:{target:string})=>file.target.endsWith("creatable-select.tsx"))).toBe(true);expect(lock.files.some((file:{target:string})=>/pdf|chart|dialog\.tsx/.test(file.target))).toBe(false);
});
