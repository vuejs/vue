/* @flow */

export const isJS = (file: string): boolean => /\.js($|\?)/.test(file)

export const isCSS = (file: string): boolean => /\.css($|\?)/.test(file)
