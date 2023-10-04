let default_UID_options = {
  blockLen: 8,
  blockNb: 2,
  blockSeparator: "-",
};

// 62^16 possible UIDs with default UID options, statistically unique
/**
 *Returns a statisticaly unique ID
 * @param {String} [prefix] Optional prefix to put before generated UID
 * @param [options] Options for block length, block number, and block separator.
 *
 * A block is a series of <blockLen> characters, with characters [a-z, A-Z, 0-9]
 * @returns {String} Statistically unique ID
 */
function UID(prefix, options = default_UID_options) {
  let chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let { blockLen } = options;
  let blockNb = 2;
  let UID = "";
  if (prefix) UID += prefix + "-";
  for (let block = 0; block < blockNb; block++) {
    for (let i = 0; i < blockLen; i++) {
      UID += chars[Math.floor(Math.random() * chars.length)];
    }
    if (block < blockNb - 1) UID += "-";
  }
  return UID;
}
