import he from 'he'
import axios from 'axios'
import _ from 'lodash'
import striptags from 'striptags'
import puppeteer from 'puppeteer'

const { find } = _

export const fetchData = async (url) => {
	const { data } = await axios.get(url)
	return data
}

const convertToMinutesAndSeconds = (seconds) => {
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

export async function getSubtitles({
	videoID,
	preferredLangs = ['vi', 'en', 'fr', 'de'],
	allowAutoTranslate = true,
}) {
	const data = await fetchData(`https://youtube.com/watch?v=${videoID}`)

	if (!data.includes('captionTracks')) {
		throw new Error(`Error not found  subtitle  for  video: ${videoID}`)
	}

	const regex = /"captionTracks":(\[.*?\])/
	const match = regex.exec(data)
	if (!match) throw new Error(`can't parse  captionTracks`)

	const { captionTracks } = JSON.parse(`{"captionTracks":${match[1]}}`)

	let subtitle = null
	let usedLang = null

	for (const lang of preferredLangs) {
		subtitle =
			find(captionTracks, { vssId: `.${lang}` }) ||
			find(captionTracks, { vssId: `a.${lang}` }) ||
			find(
				captionTracks,
				({ vssId }) => vssId && vssId.includes(`.${lang}`)
			)

		if (subtitle && subtitle.baseUrl) {
			usedLang = lang
			break
		}
	}

	if (!subtitle?.baseUrl && allowAutoTranslate) {
		subtitle = captionTracks[0]
		subtitle.baseUrl += `&tlang=${preferredLangs[0]}`
		usedLang = preferredLangs[0]
	}

	if (!subtitle?.baseUrl) {
		throw new Error(
			`not found  subtitle  precedent: ${preferredLangs.join(', ')}`
		)
	}

	const transcript = await fetchData(subtitle.baseUrl)

	const lines = transcript
		.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
		.replace('</transcript>', '')
		.split('</text>')
		.filter((line) => line.trim())
		.map((line) => {
			const start = (line.match(/start="([\d.]+)"/) || [])[1] || '0'
			const dur = (line.match(/dur="([\d.]+)"/) || [])[1] || '0'
			const htmlText = line
				.replace(/<text.+?>/, '')
				.replace(/<\/?[^>]+>/g, '')
				.replace(/&amp;/gi, '&')

			const decodedText = he.decode(htmlText)
			const text = striptags(decodedText)
			const startInSeconds = parseFloat(start)
			const durInSeconds = parseFloat(dur)

			return {
				start: convertToMinutesAndSeconds(startInSeconds),
				dur: convertToMinutesAndSeconds(startInSeconds + durInSeconds),
				seconds: Math.floor(startInSeconds),
				text,
			}
		})
	return { lang: usedLang, lines }
}
function isValidHttpUrl(string) {
	let url
	try {
		url = new URL(string)
	} catch (_) {
		return false
	}
	return url.protocol === 'http:' || url.protocol === 'https:'
}

const scrapeCleanText = async (targetUrl) => {
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()
	await page.setUserAgent(
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
	)
	await page.goto(targetUrl, {
		waitUntil: 'domcontentloaded',
		timeout: 0,
	})
	const bodyHTML = await page.evaluate(() => document.body.innerHTML)
	await browser.close()
	const removeScript = bodyHTML.replace(/<script.*?>.*?<\/script>/gs, '')
	const cleanText = removeScript
		.replace(/<\/?[^>]+>/g, '')
		.replace(/\s{2,}/g, ' ')
		.split('\n')
		.map((item) => he.decode(item.trim()))
		.filter(Boolean)

	return cleanText
}
export const getContentPage = async function (url) {
	if (isValidHttpUrl(url)) {
		try {
			const data = await axios.get(url).then((result) => result.data)
			const newData = data.match(/<body>.*?<\/body>/s)
			const removeScript = newData[0].replace(
				/<\/*?script.*?>.*?<\/script>/gs,
				''
			)
			const convertData = removeScript.replace(/(<\/?.+?>)|\s{2,}?/gs, '')
			return convertData.split('\n').filter(Boolean)
		} catch (error) {
			if (error.status === 403) {
				const data = await scrapeCleanText(url)
				return data
			}
		}
	}
}
