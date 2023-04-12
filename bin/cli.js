#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const download = require('download-git-repo');
const { spawn } = require('child_process');

program
  .command('create <project>')
  .description('Create a new project')
  .action(async (project) => {
    const projectPath = path.join(process.cwd(), project);
    if (fs.existsSync(projectPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `The directory ${project} already exists. Do you want to overwrite it?`,
          default: false,
        },
      ]);
      if (overwrite) {
        await fs.remove(projectPath);
      } else {
        console.log('Aborting...');
        process.exit(0);
      }
    }
    await fs.ensureDir(projectPath);

    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Choose the template to download:',
        choices: [
          { name: 'cysj-ui-components', value: 'https://github.com/hanxzi/cysj-ui-components.git' },
        ],
        default: 'cysj-ui-components',
      },
    ]);

    console.log(`Downloading the ${template} template...`);

    download(template, projectPath, { clone: true, protocol: 'https' }, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Installing dependencies...`);

      const child = spawn('npm', ['install'], { cwd: projectPath });
      child.on('error', (err) => console.error(err));
      child.on('close', () => {
        console.log(`The ${template} template has been downloaded and installed successfully.`);
        console.log(`To start the project, run the following command:\n\n  cd ${project} && npm start\n`);
      });
    });
  });

program.parse(process.argv);
