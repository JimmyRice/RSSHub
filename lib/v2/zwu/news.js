const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://news.zwu.edu.cn';
    const newsUrl = '/wlbb/list.htm';

    const response = await got({
        method: 'get',
        url: baseUrl + newsUrl,
    });

    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('div#wp_news_w6 ul.news_list > li.clearfix')
            .toArray()
            .map(async (news) => {
                const pubDate = new Date($(news).find('span').text()).toUTCString();
                const title = $(news).find('p > a').attr('title');
                const link = $(news).find('p > a').attr('href');

                const contentResponse = await got({
                    method: 'get',
                    url: baseUrl + link,
                });

                const content = cheerio.load(contentResponse.data);
                const description = content('div.wp_articlecontent').html();

                return {
                    title,
                    link,
                    description,
                    pubDate,
                };
            })
    );

    ctx.state.data = {
        title: '万里播报',
        link: baseUrl + newsUrl,
        item: items,
    };
};
