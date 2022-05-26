/**
 * set base to allow vite to work on Github Pages
 */

 import { defineConfig } from 'vite';
 import { resolve } from 'path';
 
 export default defineConfig(({ command, mode }) => {
   if (command === 'serve') {
     return {
       // dev specific config
       // base should be root
       base: '/'
 
     }
   } else {
     // command === 'build'
     return {
       // build specific config
       // base should be /calcproj/
       base: '/calcproj/',
 
       
       build: {
         rollupOptions: {
           // set entry points
           input: {
             main: resolve(__dirname, 'index.html'),
             two: resolve(__dirname, '2.html')
           }
         }
       }
 
     }
   }
 });
 