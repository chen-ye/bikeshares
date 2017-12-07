/* eslint-disable */
// Adapted from https://github.com/substack/cookie-cutter (under MIT license)
export default function (doc) {
  if (!doc) doc = {};
  if (typeof doc === 'string') doc = { cookie: doc };
  if (doc.cookie === undefined) doc.cookie = '';

  return {
    get: function get(key) {
      var splat = doc.cookie.split(/;\s*/);
      for (var i = 0; i < splat.length; i++) {
        var ps = splat[i].split('=');
        var k = unescape(ps[0]);
        if (k === key) {
          return unescape(ps[1]);
        }
      }
      return undefined;
    },
    set: function set(key, value) {
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          expires = _ref.expires,
          path = _ref.path,
          domain = _ref.domain,
          secure = _ref.secure;

      var s = escape(key) + '=' + escape(value);
      if (expires) {
        s += '; expires=' + expires;
      }
      if (path) {
        s += '; path=' + escape(path);
      }
      if (domain) {
        s += '; domain=' + escape(domain);
      }
      if (secure) {
        s += '; secure';
      }
      doc.cookie = s;
      return s;
    }
  };
};

if (typeof document !== 'undefined') {
  var cookie = exports(document);
  exports.get = cookie.get;
  exports.set = cookie.set;
}
//# sourceMappingURL=cookie.js.map