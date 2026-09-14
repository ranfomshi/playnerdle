export const activeBlogNumbers = ['4', '5', '6', '7', '8', '10', '15', '19'];

export const relatedBlogNumbers = new Map([
  ['4', ['5', '8']], ['5', ['4', '6']], ['6', ['10', '8']], ['7', ['8', '6']],
  ['8', ['7', '6']], ['10', ['6', '15']], ['15', ['10', '19']], ['19', ['15', '10']]
]);

// Retired articles overlapped the site's evergreen selection guides or did not
// add enough distinct search intent to justify a separate indexable page.
export const retiredBlogRedirects = new Map([
  ['1', '/daily-word-games/'],
  ['2', '/daily-word-games/'],
  ['3', '/blogs/'],
  ['9', '/wordle-alternatives/'],
  ['11', '/daily-word-games/'],
  ['12', '/wordle-alternatives/'],
  ['13', '/wordle-alternatives/'],
  ['14', '/daily-word-games/'],
  ['16', '/daily-word-games/'],
  ['17', '/wordle-alternatives/'],
  ['18', '/daily-word-games/'],
  ['20', '/wordle-alternatives/'],
  ['21', '/no-download-games/'],
  ['22', '/daily-word-games/'],
  ['23', '/wordle-alternatives/']
]);
