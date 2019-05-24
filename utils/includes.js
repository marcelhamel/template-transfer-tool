let Includes = {};

// Scrapes all instances of Zephyr's "include" command out of an HTML string.
Includes.findAllInHTML = (str) => {
  return new Promise((resolve, reject) => {
    let startIndex = 0, index, str_delim, includes = [];
    try {
      while ((index = str.indexOf('include', startIndex)) > -1) {
        index += 7;
        let single_quot_delim = str.indexOf("'", index);
        let double_quot_delim = str.indexOf('"', index);
        if (single_quot_delim === -1) {
          str_delim = '"';
        } else if (double_quot_delim === -1) {
          str_delim = "'";
        } else {
          str_delim = single_quot_delim < double_quot_delim ? "'" : '"';
        }
        let open_quote = str.indexOf(str_delim, index) + 1;
        let close_quote = str.indexOf(str_delim, open_quote);
        includes.push(str.substring(open_quote,close_quote))
        startIndex = close_quote;
      }
      resolve(includes);
    } catch(err) {
      resolve(['']);
    }
  })
};


/*
  Checks destination account for existence of include with same name as one
  to be posted. Appends "_import_copy" to name to avoid unintentionally overwriting
  includes. Need to add option to toggle this.
*/
Includes.duplicateCheck = async (str, dest) => {
  const response = await dest.apiGet('include', {'include': str}, (err, res) => {
      Promise.resolve(res.content_html ? str + "_import_copy" : str);
    })

  return response;
};

// Gets include from source account.
Includes.getInclude = async (str, src) => {
  console.log("include name: ", str);

  const response = await src.apiGet('include', {include: str}, (err, res) => {
    Promise.resolve(res.content_html ? res : '');
  })

  return response;
};

// Posts include to destination account.
Includes.postInclude = async (include, dest) => {
  const response = await dest.apiPost('include', {
    include: include.name,
    content_html: include.content_html
  }, (post_err, post_res) => Promise.resolve('Do nothing.'));

  return response;
};

module.exports = Includes;
