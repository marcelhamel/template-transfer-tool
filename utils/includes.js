const { getInclude, postInclude, listIncludes } = require('../services/sailthru');

const Includes = {
  // Scrapes all instances of Zephyr's "include" command out of an HTML string.
  findIncludes: (str) => {
    try {
      return [...str.match(/(?<={include ["']).*(?=["']})/g)];
    } catch(e) {
      return [];
    }
  },

  /*
    This builds a map of includes between both accounts and diffs the strings where necessary to make sure we only post what's necessary.
    Posting includes at a high volume tends to leads to duplication errors within the API. This SHOULD be fixed internally but since
    I don't work on that part of the platform I can't say when it will happen.
  */
  processIncludes: (includes, src, dest) => {
    return new Promise((resolve, reject) => {
      let includeMap, postResponses;

      // 1. Get all includes from source.
      Promise.all(includes.map(x => getInclude(x, src)))
      // 2. Convert array response to object then get includes from destination
      .then(sourceData => {
        includeMap = sourceData.reduce((obj, x) => ({...obj, [x.name]: { src: x.content_html, write: true }}), {});
        console.log(`Mapped ${Object.keys(includeMap).length} includes from source. Listing those in destination account...`);
        return listIncludes(dest)
      // 3. Complete building map and then attempt to figure out what needs to be transferred.
      }).then(destResponse => {
        destResponse.includes.forEach(x => { if (includeMap[x.name]) includeMap[x.name]['write'] = false });

        const incToDiff = Object.keys(includeMap).filter(x => includeMap[x]['write'] === false);
        return Promise.all(incToDiff.map(x => getInclude(x, dest)));
      }).then(destIncludes => {
        // Figure out what needs to be written, if anything.
        destIncludes.forEach(x => includeMap[x.name]['dest'] = x.content_html);
        for (const key in includeMap) {
          const srcHTML = includeMap[key]['src'];
          const destHTML = includeMap[key]['dest'];
          if (!!destHTML && srcHTML !== destHTML) {
            includeMap[key]['write'] = true;
          }
        };

        const includesToWrite = Object.keys(includeMap).filter(x => includeMap[x]['write'] === true);

        console.log(`${includesToWrite.length} includes need to be written. Sit tight!`);
        if (includesToWrite.length === 0) {
          return [];
        } else {
          return Promise.all(includesToWrite.map(x => postInclude({ name: x, content_html: includeMap[x]['src']}, dest)))
        }
      }).then(resp => {
        postResponses = resp.length > 0 ? resp.map(x => `Posted ${x.name} to Sailthru.`) : ['No includes to post!'];
        resolve(postResponses);
      })
      .catch(err => {
        console.log('Error: ', err);
        reject(err)
      });
    });
  }
};

module.exports = Includes;
