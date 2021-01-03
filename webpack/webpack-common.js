
const crypto = require('crypto')
const glob = require('glob')
const path = require('path')
const webpack = require('webpack')

const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const InjectPlugin = require('webpack-inject-plugin').default
const WebpackShellPlugin = require('webpack-shell-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')


const THEMES = ['dark', 'light']

const LAUNCHER_ICON_SIZES = [16, 32, 36, 48, 64, 72, 96, 144, 192, 256, 384, 512]
const LAUNCHER_ICON_SRC_NAME = 'launcher-icon.svg'
const LAUNCHER_ICON_NAME_TEMPLATE = 'launcher-icon-{size}.png'
const RSVG_CONVERT_CMD_TEMPLATE = 'rsvg-convert -w {size} -h {size} -f png -o {outfile} {infile}'

const JS_DIR = 'js'
const CSS_DIR = 'css'
const IMG_DIR = 'img'
const FONT_DIR = 'font'
const LESS_DIR = 'less'
const TMPL_DIR = 'templates'
const DIST_DIR = 'dist'

const LESS_REGEX = new RegExp(`${LESS_DIR}/.*\\.less$`)
const QUI_JS_REGEX = new RegExp(`qui/${JS_DIR}/.*\\.jsm?$`)
const QUI_LESS_REGEX = new RegExp(`qui/${LESS_DIR}/.*\\.less$`)
const IMG_REGEX = new RegExp(`${IMG_DIR}/.*\\.(svg|png|gif|jpg|jpe?g|ico)$`)
const FONT_REGEX = new RegExp(`${FONT_DIR}/.*\\.(woff)$`)
const TMPL_REGEX = new RegExp(`${TMPL_DIR}/.*\\.(html|json|js)$`)


function escapeForLess(s) {
    return `~"${s}"`
}

function requireFromDir(regex, path, excludeRegex) {
    let filePaths = glob.sync(path + '/**')

    filePaths = filePaths.filter(p => p.match(regex))
    if (excludeRegex) {
        filePaths = filePaths.filter(p => !p.match(excludeRegex))
    }

    return filePaths
}

function makeLessRule({type, theme, isProduction, appName, appFullPath, quiFullPath, appVersion, buildHash}) {
    let quiRelPath = isProduction ? '' : '../qui/'

    let appLessPath = path.resolve(appFullPath, LESS_DIR)
    let quiLessPath = path.resolve(quiFullPath, LESS_DIR)

    let appImgPath = `../${IMG_DIR}`
    let appFontPath = `../${FONT_DIR}`
    let quiImgPath = `${quiRelPath}${IMG_DIR}`
    let quiFontPath = `${quiRelPath}${FONT_DIR}`

    let appLessRegex = new RegExp(appFullPath.split('/').slice(-1)[0] + `/${LESS_DIR}/.*\\.less$`)

    const lessLoader = {
        loader: 'less-loader',
        options: {
            lessOptions: {
                globalVars: {
                    qui_theme: theme,
                    app_img_path: appImgPath,
                    app_font_path: appFontPath,
                    qui_img_path: escapeForLess(quiImgPath),
                    qui_font_path: escapeForLess(quiFontPath),
                    qui_less_path: escapeForLess(quiLessPath)
                }
            }
        }
    }

    const cssLoader = {
        loader: 'css-loader',
        options: {
            url: false
        }
    }

    const adjustCSSUrlsLoader = {
        loader: path.resolve(quiFullPath, 'webpack', 'webpack-adjust-css-urls-loader.js'),
        options: {
            appLessPath: appLessPath,
            quiLessPath: quiLessPath,
            additionalDirs: 1
        }
    }

    const fileLoader = {
        loader: 'file-loader',
        options: {
            name: `${CSS_DIR}/${theme}/[1].css`,
            regExp: /less\/(.*)\.less$/
        }
    }

    const hashURLLoader = {
        loader: 'string-replace-loader',
        options: {
            multiple: [
                { /* URLs with query arguments */
                    search: 'url\\(([\'"])?(?!http)(.+?\\?.+?)([\'"])?\\)',
                    replace: 'url($1$2&h=' + buildHash + '$3)',
                    flags: 'g'
                },
                { /* URLs without query arguments */
                    search: 'url\\(([\'"])?(?!http)([^\\?]+?)([\'"])?\\)',
                    replace: 'url($1$2?h=' + buildHash + '$3)',
                    flags: 'g'
                }
            ]
        }
    }

    let loaders
    if (isProduction) {
        loaders = [
            MiniCssExtractPlugin.loader,
            cssLoader,
        ]
    }
    else { /* Development mode */
        loaders = [
            fileLoader,
            adjustCSSUrlsLoader
        ]
    }

    loaders.push(hashURLLoader)
    loaders.push(lessLoader)

    return {
        test: (type === 'qui') ? QUI_LESS_REGEX : appLessRegex,
        use: loaders
    }
}

function makeStaticCopyRule(regex, staticDir, searchReplace = []) {
    let loaders = [
        {
            loader: 'file-loader',
            options: {
                name: `${staticDir}/[name].[ext]`
            }
        }
    ]

    searchReplace = searchReplace.map(sr => ({search: sr[0], replace: sr[1]}))

    if (searchReplace.length) {
        loaders.push({
            loader: 'string-replace-loader',
            options: {
                multiple: searchReplace
            }
        })
    }

    return {
        test: regex,
        type: 'javascript/auto',  /* Disables processing of JSON files */
        use: loaders
    }
}

function makeLauncherIconsCmd(appFullPath, distFullPath) {
    let cmds = [
        `test -f ${appFullPath}/${IMG_DIR}/${LAUNCHER_ICON_SRC_NAME} || exit 0`,
        `mkdir -p ${path.resolve(distFullPath, IMG_DIR)}`
    ]

    let srcFullPath = path.resolve(appFullPath, IMG_DIR, LAUNCHER_ICON_SRC_NAME)

    LAUNCHER_ICON_SIZES.forEach(function (size) {
        let iconName = LAUNCHER_ICON_NAME_TEMPLATE.replace(new RegExp('{size}', 'g'), size.toString())
        let iconNameFullPath = path.resolve(distFullPath, IMG_DIR, iconName)
        let cmd = RSVG_CONVERT_CMD_TEMPLATE.replace(new RegExp('{size}', 'g'), size.toString())
                                           .replace(new RegExp('{infile}', 'g'), srcFullPath)
                                           .replace(new RegExp('{outfile}', 'g'), iconNameFullPath)

        cmds.push(cmd)
    })

    return cmds.join(' && ')
}

function makeJSRule({type, appFullPath}) {
    let appJSRegex = new RegExp(appFullPath.split('/').slice(-1)[0] + `/${JS_DIR}/.*\\.jsm?$`)

    return {
        test: (type === 'qui') ? QUI_JS_REGEX : appJSRegex,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-proposal-class-properties']
                }
            }
        ]
    }
}

function makeConfig({theme, isProduction, appName, appFullPath, extraFiles, cssOnly}) {
    /* QUI is assumed to live in `node_modules` */
    let quiFullPath = path.resolve(__dirname, '..')

    let quiLessPath = path.resolve(quiFullPath, LESS_DIR)
    let appLessPath = path.resolve(appFullPath, LESS_DIR)
    let quiJSPath = path.resolve(quiFullPath, JS_DIR)
    let appJSPath = path.resolve(appFullPath, JS_DIR)
    let nodeJSPath = path.resolve(appJSPath, '..', 'node_modules')
    let quiImgPath = path.resolve(quiFullPath, IMG_DIR)
    let appImgPath = path.resolve(appFullPath, IMG_DIR)
    let quiFontPath = path.resolve(quiFullPath, FONT_DIR)
    let appFontPath = path.resolve(appFullPath, FONT_DIR)
    let quiTmplPath = path.resolve(quiFullPath, TMPL_DIR)
    let appTmplPath = path.resolve(appFullPath, TMPL_DIR)

    /* Use project root folder in development mode, since we're only building CSS
     * and we rely on every other asset to be used directly from the project folder */
    let distFullPath = isProduction ? path.resolve(appFullPath, DIST_DIR) : appFullPath

    let excludeLessRegex = new RegExp('theme-(' + THEMES.join('|') + ')\\.less', 'i')
    let cssRequirements = [
        ...requireFromDir(LESS_REGEX, quiLessPath, excludeLessRegex),
        ...requireFromDir(LESS_REGEX, appLessPath, excludeLessRegex)
    ]

    /* This is needed because FixStyleOnlyEntriesPlugin() needs resources for theme entries to be different */
    cssRequirements.push(path.resolve(quiLessPath, `theme-${theme}.less`))

    let mainRequirements = [
        appJSPath,

        /* Add image requirements */
        ...requireFromDir(IMG_REGEX, quiImgPath),
        ...requireFromDir(IMG_REGEX, appImgPath),

        /* Add font requirements */
        ...requireFromDir(FONT_REGEX, quiFontPath),
        ...requireFromDir(FONT_REGEX, appFontPath),

        /* Add template requirements */
        ...requireFromDir(TMPL_REGEX, quiTmplPath),
        ...requireFromDir(TMPL_REGEX, appTmplPath)
    ]

    // TODO add extraFiles to requirements

    let mainEntryName = `${appName}-bundle`
    let shellCommands = []
    let entries = {}
    entries[`${appName}-bundle-${theme}`] = cssRequirements
    if (!cssOnly && isProduction) {
        entries[mainEntryName] = mainRequirements
    }

    if (cssOnly) {
        shellCommands.push(makeLauncherIconsCmd(appFullPath, distFullPath))
    }

    let packageJSON = require(path.resolve(appFullPath, 'package.json'))
    let appVersion = packageJSON.version
    let buildHash = crypto.createHash('sha256').update(appVersion).digest('hex').substring(0, 16)

    return {
        entry: entries,
        resolve: {
            alias: {
                $qui: quiJSPath,
                $app: appJSPath,
                $node: nodeJSPath
            }
        },
        output: {
            path: distFullPath
        },
        devtool: isProduction ? 'source-map' : false,
        module: {
            rules: [
                makeLessRule({
                    type: 'qui', theme: theme, isProduction: isProduction,
                    appName: appName, appFullPath: appFullPath, quiFullPath: quiFullPath,
                    appVersion: appVersion, buildHash: buildHash
                }),
                makeLessRule({
                    type: 'app', theme: theme, isProduction: isProduction,
                    appName: appName, appFullPath: appFullPath, quiFullPath: quiFullPath,
                    appVersion: appVersion, buildHash: buildHash
                }),
                makeStaticCopyRule(IMG_REGEX, IMG_DIR),
                makeStaticCopyRule(FONT_REGEX, FONT_DIR),
                makeStaticCopyRule(TMPL_REGEX, TMPL_DIR, [
                    ['__app_name_placeholder__', appName],
                    ['__app_version_placeholder__', appVersion]
                ]),
                makeJSRule({type: 'qui', appFullPath: appFullPath}),
                makeJSRule({type: 'app', appFullPath: appFullPath})
            ]
        },
        plugins: [
            new MiniCssExtractPlugin(),
            new InjectPlugin(
                function () {
                    return `window.__quiAppVersion='${appVersion}';`
                },
                {
                    entryName: mainEntryName,
                    entryOrder: 1 /* First */
                }
            ),
            new FixStyleOnlyEntriesPlugin(),
            new WebpackShellPlugin({
                onBuildEnd: shellCommands,
                safe: true
            }),
            new webpack.ProgressPlugin({
                entries: true,
                modules: true,
                profile: true
            }),
            new webpack.ProvidePlugin({
                'jQuery': path.resolve(path.join(__dirname, '../js/lib/jquery.js')),
                'window.jQuery': path.resolve(path.join(__dirname, '../js/lib/jquery.js')),
                'window.logger': path.resolve(path.join(__dirname, '../js/lib/logger.js')),
                'window.pep': path.resolve(path.join(__dirname, '../js/lib/pep.js'))
            })
        ],
        performance: {
            maxEntrypointSize: 1024 * 1024,
            maxAssetSize: 1024 * 1024
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    sourceMap: true
                }),
                new OptimizeCssAssetsPlugin({
                    assetNameRegExp: /-bundle-.*\.css$/g,
                    cssProcessorPluginOptions: {
                        preset: ['default', {
                            discardComments: { removeAll: true },
                            mergeRules: false
                        }]
                    }
                })
            ]
        }
    }
}

function makeConfigs({isProduction, appName, appFullPath, extraFiles}) {
    /* Repeat the configuration for each theme, but only build JS once, the first time */

    return THEMES.map((theme, i) => makeConfig({
        theme: theme,
        isProduction: isProduction,
        appName: appName,
        appFullPath: appFullPath,
        extraFiles: extraFiles,
        cssOnly: i > 0
    }))
}


module.exports = {
    THEMES: THEMES,

    requireFromDir: requireFromDir,
    makeLessRule: makeLessRule,
    makeStaticCopyRule: makeStaticCopyRule,
    makeConfig: makeConfig,
    makeConfigs: makeConfigs
}
