export default (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const isParseError = doc.querySelector('parsererror');
  if (isParseError) {
    const error = new Error();
    error.message = 'invalidRSS';
    error.isParserError = true;
    error.isParserError = isParseError;
    throw error;
  }
  const feedTitle = doc.querySelector('title');
  const feedDescription = doc.querySelector('description');
  const items = [...doc.querySelectorAll('item')]
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));
  return {
    feed: {
      title: feedTitle.textContent,
      description: feedDescription.textContent,
    },
    posts: [...items],
  };
};
