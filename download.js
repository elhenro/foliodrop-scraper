const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

async function downloadImage (url, name) {
  const writer = fs.createWriteStream(path.resolve(__dirname, 'images', name))
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage()

    const pagesToScrape = [
      // put pages you want to scrape here
    ]
    for (const pageUrl of pagesToScrape) {
      await page.goto(pageUrl)

      await page.waitForSelector('#main #wrapper #section .pointer', { visible: true })
      console.log('visible')

      const images = await page.evaluate(async() => {
        console.log('checking thumbs')
        const arr = []
        const aaa = window.document.querySelectorAll('.pointer')

        let count = 0
        const maxCount = Infinity
        // const maxCount = 2

        for (const b of aaa) {
          if (count > maxCount) continue
          arr.push(b.src)
          b.click()
          await new Promise(function(resolve) {
            setTimeout(resolve, 2000)
          })
          const xx = window.document.querySelectorAll('#portfolioGaleryInner img')
          for (const xxx of xx) {
            arr.push(xxx.src)
          }
          window.document.querySelector('.closeModalBtn').click()
          count ++
        }
        return arr
      })

      fs.writeFileSync('./images.json', JSON.stringify(images, null, 2))
      for (const url of images) {
        await downloadImage(url, url.split('/').pop())
        await sleep(200)
      }
      console.log('done', images)
    }
  } catch (err) {
    console.error(err.message)
  }
})()
