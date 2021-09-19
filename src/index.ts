import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import packageInfo from '../package.json';
import generateCompileConfig from './generateCompileConfig';
import createLogger from './createLogger';
// import { stringify } from './helpers';

enum ARGS {
    inputFolderPath = 'input-folder-path',
    outputFilePath = 'output-file-path',
    repositoryName = 'repository-name',
    // logLevel = 'log-level',
}

const logger = createLogger(__filename);

// logger.debug('');
// logger.debug(`Process started with args: ${stringify(process.argv)}`);

setupProcessEventListeners();

(async function main(): Promise<void> {
    const {
        [ARGS.outputFilePath]: outputFilePath,
        [ARGS.inputFolderPath]: inputFolderPath,
        [ARGS.repositoryName]: repositoryName,
        // [ARGS.logLevel]: logLevel,
    } = await parseProcessArgs();

    // global.LOG_LEVEL = logLevel;

    logger.info(`${ARGS.inputFolderPath}: '${inputFolderPath}'.`);
    logger.info(`${ARGS.outputFilePath}: '${outputFilePath}'.`);
    logger.info(`${ARGS.repositoryName}: '${repositoryName}'.`);

    await generateCompileConfig(inputFolderPath, repositoryName, outputFilePath);
})();

async function parseProcessArgs() {
    // const binName: string = Object.keys(packageInfo.bin)[0];
    const pkgName: string = packageInfo.name;
    const { argv } = yargs(hideBin(process.argv))
        .scriptName(pkgName)
        .usage('\nUsage: node $0.js [options...]')
        .showHelpOnFail(true)
        .strict()
        .detectLocale(false)
        .locale('en')
        // https://github.com/yargs/yargs/blob/HEAD/docs/api.md#optionkey-opt
        .option(ARGS.inputFolderPath, {
            alias: 'i',
            describe: 'Path to folder with SIF-files.',
            type: 'string',
            demandOption: true,
            normalize: true,
        })
        .option(ARGS.outputFilePath, {
            alias: 'o',
            describe: 'Path to output XML-file.',
            type: 'string',
            demandOption: true,
            normalize: true,
        })
        .option(ARGS.repositoryName, {
            alias: 'r',
            describe: 'Name of Siebel repository.',
            type: 'string',
            default: 'Siebel Repository',
        })
        // .option(ARGS.logLevel, {
        //     alias: 'r',
        //     describe: 'Log level.',
        //     type: 'string',
        //     default: 'info',
        //     choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
        // })
        .version('version', packageInfo.version)
        .alias('version', 'v')
        .help('help')
        .alias('help', ['h', '?']);

    return argv;
}

function setupProcessEventListeners() {
    process.on('exit', (code) => {
        logger.debug(`Process exited with code: '${code}'.\r\n\r\n`);
    });
    process.on('warning', (warning) => {
        logger.warn('Warning: ', warning);
    });
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception: ', err);
        process.exit(1);
    });
    process.on('unhandledRejection', (err, promise) => {
        logger.error(`Unhandled Rejection at: `, promise, `with reason: `, err);
        process.exit(1);
    });
}
