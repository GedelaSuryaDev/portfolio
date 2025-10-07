#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import kleur from 'kleur';
import simpleGit from 'simple-git';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const blogsFile = path.join(dataDir, 'blogs.json');
const resourcesFile = path.join(dataDir, 'resources.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

async function manage(type) {
  const file = type === 'blogs' ? blogsFile : resourcesFile;
  let list = readJson(file);
  while (true) {
    console.log('\n' + kleur.bold().cyan(`${type.toUpperCase()} (${list.length})`));
    const { action } = await inquirer.prompt({
      type: 'list', name: 'action', message: 'What do you want to do?',
      choices: [
        { name: 'Add', value: 'add' },
        { name: 'Edit', value: 'edit' },
        { name: 'Remove', value: 'remove' },
        { name: 'Back', value: 'back' }
      ]
    });
    if (action === 'back') break;

    if (action === 'add') {
      if (type === 'blogs') {
        const ans = await inquirer.prompt([
          { name: 'date', message: 'Date (e.g., Oct 7, 2025)' },
          { name: 'title', message: 'Title' },
          { name: 'url', message: 'URL (Medium link)' },
          { name: 'excerpt', message: 'Short excerpt' }
        ]);
        list.unshift(ans);
      } else {
        const ans = await inquirer.prompt([
          { name: 'icon', message: 'Icon (emoji or short text)', default: '📘' },
          { name: 'title', message: 'Title' },
          { name: 'description', message: 'Description' },
          { name: 'link', message: 'Link (file or URL)' },
          { name: 'cta', message: 'CTA Label', default: 'Open' }
        ]);
        list.unshift(ans);
      }
    }

    if (action === 'edit' || action === 'remove') {
      if (!list.length) { console.log(kleur.yellow('No items yet.')); continue; }
      const { index } = await inquirer.prompt({
        type: 'list', name: 'index', message: 'Select item',
        choices: list.map((it, i) => ({ name: type === 'blogs' ? `${it.date} – ${it.title}` : it.title, value: i }))
      });
      if (action === 'remove') {
        list.splice(index, 1);
      } else {
        const item = list[index];
        const ans = await inquirer.prompt(Object.keys(item).map(k => ({ name: k, message: k, default: item[k] })));
        list[index] = ans;
      }
    }

    writeJson(file, list);
    console.log(kleur.green('Saved. Preview by refreshing your site.'));
  }
}

async function deploy() {
  const git = simpleGit();
  await git.add(['data/*.json', 'index.html', 'styles.css', 'script.js']);
  await git.commit(`chore(cms): content update ${new Date().toISOString()}`);
  await git.push();
  console.log(kleur.green('\nPushed to origin. If using GitHub Pages from main, it will go live shortly.'));
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'deploy') return deploy();
  while (true) {
    const { section } = await inquirer.prompt({
      type: 'list', name: 'section', message: 'Manage which section?',
      choices: [
        { name: 'Blogs', value: 'blogs' },
        { name: 'Resources', value: 'resources' },
        { name: 'Deploy (commit & push)', value: 'deploy' },
        { name: 'Exit', value: 'exit' }
      ]
    });
    if (section === 'exit') break;
    if (section === 'deploy') { await deploy(); continue; }
    await manage(section);
  }
}

main();

