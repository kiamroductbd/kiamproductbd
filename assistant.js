/* Kiam Product Bd shop assistant: answers ONLY from the shop's own facts (assistant-data.js). No AI, no invented text. */
(function () {
  var D = window.KIAM_DATA;
  if (!D) return;
  var BN = "০১২৩৪৫৬৭৮৯";
  function norm(s) {
    s = String(s || "").toLowerCase();
    s = s.replace(/[০-৯]/g, function (c) { return BN.indexOf(c); });
    s = s.replace(/([a-z])[\s\-]+(\d)/g, "$1$2").replace(/(\d)[\s\-]+([a-z])/g, "$1$2");
    s = s.replace(/\u09AF\u09BC/g, "\u09DF").replace(/[?।!,.:;()"'’]/g, " ").replace(/\s+/g, " ").trim();
    return s;
  }
  D.products.forEach(function (p) { var seen = {}; p.keys = p.keys.map(norm).filter(function (k) { if (seen[k]) return false; seen[k] = 1; return true; }); });
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN.charAt(d); }); }
  function has(q, list) { for (var i = 0; i < list.length; i++) { if (q.indexOf(norm(list[i])) !== -1) return true; } return false; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function link(text, href, cls, ext) { var a = el("a", cls, text); a.href = href; if (ext) { a.target = "_blank"; a.rel = "noopener"; } return a; }

  var fab = el("button", "ast-fab"); fab.type = "button"; fab.setAttribute("aria-label", "প্রশ্ন করুন, সহকারীর সাথে কথা বলুন");
  fab.appendChild(el("span", "ast-fab-ico", "💬")); fab.appendChild(el("span", "ast-fab-txt", "প্রশ্ন করুন"));
  var panel = el("section", "ast-panel"); panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Kiam সহকারী");
  var head = el("div", "ast-head");
  var ht = el("div", "ast-title"); ht.appendChild(el("b", null, "Kiam সহকারী")); ht.appendChild(el("span", null, "দোকানের জানা তথ্য থেকে উত্তর দিই"));
  var close = el("button", "ast-close", "✕"); close.type = "button"; close.setAttribute("aria-label", "বন্ধ করুন");
  head.appendChild(ht); head.appendChild(close);
  var log = el("div", "ast-log"); log.setAttribute("aria-live", "polite");
  var chips = el("div", "ast-chips");
  var form = el("form", "ast-form");
  var input = el("input"); input.type = "text"; input.placeholder = "পণ্য, বাজেট বা প্রশ্ন লিখুন..."; input.setAttribute("aria-label", "আপনার প্রশ্ন"); input.autocomplete = "off";
  var send = el("button", "ast-send", "পাঠান"); send.type = "submit";
  form.appendChild(input); form.appendChild(send);
  var foot = el("div", "ast-foot");
  foot.appendChild(link("📞 ফোন করুন", "tel:" + D.tel, "ast-act"));
  foot.appendChild(link("WhatsApp", "https://wa.me/" + D.wa, "ast-act ast-wa", true));
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form); panel.appendChild(foot);
  document.body.appendChild(fab); document.body.appendChild(panel);

  function scroll() { log.scrollTop = log.scrollHeight; }
  function bot(parts) {
    var b = el("div", "ast-msg ast-bot");
    parts.forEach(function (p) { if (typeof p === "string") { var d = el("p", null, p); b.appendChild(d); } else b.appendChild(p); });
    log.appendChild(b); scroll(); return b;
  }
  function me(t) { log.appendChild(el("div", "ast-msg ast-me", t)); scroll(); }
  function acts(list) {
    var w = el("div", "ast-actions");
    list.forEach(function (a) { w.appendChild(link(a[0], a[1], "ast-act" + (a[2] ? " " + a[2] : ""), !!a[3])); });
    return w;
  }
  function card(p) {
    var c = el("div", "ast-card");
    if (p.img) { var im = el("img"); im.src = p.img; im.alt = p.name; im.width = 64; im.height = 64; im.loading = "lazy"; c.appendChild(im); }
    var t = el("div", "ast-ct");
    t.appendChild(el("b", null, p.name)); t.appendChild(el("span", "ast-model", p.model)); t.appendChild(el("strong", "ast-price", p.price));
    var feats = el("ul"); p.feats.slice(0, 4).forEach(function (f) { feats.appendChild(el("li", null, f)); }); t.appendChild(feats);
    if (p.note) t.appendChild(el("em", null, p.note));
    var a = [];
    if (p.slug) a.push(["বিস্তারিত দেখুন", p.slug]);
    a.push(["WhatsApp-এ অর্ডার", "https://wa.me/" + D.wa + "?text=" + encodeURIComponent("আসসালামু আলাইকুম, আমি এই পণ্যটি নিতে চাই: " + p.wa), "ast-wa", true]);
    t.appendChild(acts(a)); c.appendChild(t); return c;
  }

  var TAIL = "সব পণ্যে ১ বছরের ওয়ারেন্টি আছে, ডেলিভারি সারা বাংলাদেশে ফ্রি। দাম বদলাতে পারে, অর্ডারের আগে ফোনে বা হোয়াটসঅ্যাপে নিশ্চিত করে নিন।";
  function callRow() { return acts([["📞 ফোন করুন " + D.telShow, "tel:" + D.tel], ["WhatsApp-এ লিখুন", "https://wa.me/" + D.wa, "ast-wa", true]]); }

  function showProducts(list, intro) {
    var parts = [intro];
    list.slice(0, 4).forEach(function (p) { parts.push(card(p)); });
    if (list.length > 4) parts.push("আরও " + (list.length - 4) + "টি পণ্য আছে।");
    parts.push(TAIL);
    parts.push(acts([["সব পণ্যের দাম তালিকা", D.pricePage]]));
    bot(parts);
  }

  function findProducts(q) {
    var scored = [];
    D.products.forEach(function (p) {
      var s = 0;
      p.keys.forEach(function (k) { if (q.indexOf(k) !== -1) s += (k.length >= 3 && /\d/.test(k)) ? 5 : 1; });
      if (s > 0) scored.push([s, p]);
    });
    if (!scored.length) return [];
    var top = Math.max.apply(null, scored.map(function (x) { return x[0]; }));
    return scored.filter(function (x) { return x[0] === top; }).map(function (x) { return x[1]; });
  }
  function budget(q) {
    if (!has(q, ["টাকা", "বাজেট", "budget", "মধ্যে", "নিচে", "under", "below", "within", "পর্যন্ত", "tk", "taka"])) return null;
    var m = q.match(/(\d{3,5})/); if (!m) return null;
    var n = parseInt(m[1], 10); return n >= 100 ? n : null;
  }

  function answer(raw) {
    var q = norm(raw);
    if (!q) return;
    if (has(q, ["আপনি কে", "তুমি কে", "who are you", "আপনার পরিচয়"])) {
      return bot(["আমি Kiam Product Bd-এর অনলাইন সহকারী। আমি কৃত্রিম বুদ্ধিমত্তা নই, দোকানের জানা তথ্য (পণ্য, দাম, ডেলিভারি, পেমেন্ট, ওয়ারেন্টি) থেকে উত্তর দিই। যা জানি না, তা বানিয়ে বলি না, ফোন বা হোয়াটসঅ্যাপে পাঠিয়ে দিই।", callRow()]);
    }
    if (has(q, ["সালাম", "হ্যালো", "হাই", "hello", "হেলো"]) || q === "hi") {
      return bot(["ওয়ালাইকুম আসসালাম! কী জানতে চান? নিচের বোতামে চাপ দিতে পারেন, বা পণ্যের নাম লিখুন।"]);
    }
    if (has(q, ["ধন্যবাদ", "thanks", "thank"])) return bot(["আপনাকেও ধন্যবাদ। আর কিছু জানার থাকলে লিখুন।"]);
    if (has(q, ["অনুমোদিত", "অথরাইজড", "authorized", "authorised", "অফিসিয়াল", "official", "ডিলার", "dealer", "নকল", "duplicate", "অরিজিনাল", "original", "আসল"])) {
      return bot(["আমরা কুমারখালী, কুষ্টিয়ার একটি দোকান, Kiam পণ্য অনলাইনে বিক্রি করি। সব পণ্যে ১ বছরের ওয়ারেন্টি দিই, আর নষ্ট পণ্য ৫ দিনের মধ্যে ফেরত নিই। এর বাইরে এ বিষয়ে আরও জানতে সরাসরি ফোন করুন।", callRow()]);
    }
    if (has(q, ["ছাড়", "অফার", "ডিসকাউন্ট", "discount", "offer", "কমে", "দাম কমান", "কম দাম"])) {
      return bot(["পণ্যের পাশে লেখা দামই আমাদের দাম। ছাড় বা অফার চলছে কি না, তা আমার জানা নেই। ফোনে জিজ্ঞেস করে নিন।", callRow()]);
    }
    if (has(q, ["স্টক", "stock", "available", "পাওয়া যাবে", "আছে কি"])) {
      return bot(["পণ্য এখন স্টকে আছে কি না, আমি দেখতে পারি না। ফোন বা হোয়াটসঅ্যাপে জিজ্ঞেস করলে আমরা জানিয়ে দেব।", callRow()]);
    }
    if (has(q, ["ইনফ্রারেড", "infrared"]) && has(q, ["ইন্ডাকশন", "ইনডাকশন", "induction"]) && has(q, ["পার্থক্য", "কোনটা", "difference", "ভালো", "বনাম", "vs"])) {
      return bot(["ইন্ডাকশন চৌম্বকীয় তরঙ্গে সরাসরি পাত্র গরম করে, কিন্তু শুধু চুম্বক আটকায় এমন পাত্রে চলে। ইনফ্রারেড প্রায় সব ধরনের পাত্রে চলে, তবে প্লেট বেশি গরম হয় আর ঠান্ডা হতে সময় নেয়।", acts([["পুরো গাইড পড়ুন", D.guide]])]);
    }
    var b = budget(q);
    if (b) {
      var cat = findProducts(q.replace(/\d+/g, " "));
      var pool = cat.length ? cat : D.products;
      var ok = pool.filter(function (p) { return p.num <= b; }).sort(function (x, y) { return y.num - x.num; });
      if (ok.length) return showProducts(ok, bn(b) + " টাকার মধ্যে এই পণ্যগুলো আছে:");
      return bot(["এই বাজেটের মধ্যে আমাদের কোনো পণ্য নেই। সবচেয়ে কম দামের পণ্য " + bn(Math.min.apply(null, D.products.map(function (p) { return p.num; }))) + " টাকার।", acts([["সব পণ্যের দাম তালিকা", D.pricePage]])]);
    }
    if (has(q, ["দাম তালিকা", "সব পণ্য", "কী কী আছে", "কি কি আছে", "price list", "কি কি পণ্য", "কী কী পণ্য", "পণ্যের তালিকা"])) {
      var all = D.products.slice().sort(function (x, y) { return x.num - y.num; });
      var rows = el("ul", "ast-list");
      all.forEach(function (p) { rows.appendChild(el("li", null, p.name + ": " + p.price)); });
      return bot(["আমাদের সব পণ্য ও দাম:", rows, acts([["বিস্তারিত দাম তালিকা", D.pricePage]])]);
    }
    var found = findProducts(q);
    if (found.length) return showProducts(found, found.length === 1 ? "এই পণ্যটির তথ্য:" : "এই পণ্যগুলো আছে:");
    if (has(q, ["ডেলিভারি", "delivery", "কুরিয়ার", "courier", "কত দিন", "কতদিন", "পৌঁছ", "পৌছ", "শিপিং"])) {
      return bot(["ডেলিভারি সারা বাংলাদেশে ফ্রি। পণ্য ২-৩ দিনের মধ্যে পৌঁছে যায়।"]);
    }
    if (has(q, ["পেমেন্ট", "payment", "টাকা দি", "বিকাশ", "bkash", "নগদ", "nagad", "ক্যাশ", "cash", "হাতে পেয়ে", "অগ্রিম", "অ্যাডভান্স"])) {
      return bot(["তিনভাবে টাকা দিতে পারেন:", "১) হোম ডেলিভারিতে পণ্য হাতে পেয়ে টাকা", "২) বিকাশে " + D.telShow + " (ব্যক্তিগত নম্বর, সেন্ড মানি)", "৩) নগদে " + D.telShow + " (ব্যক্তিগত নম্বর, সেন্ড মানি)", "বিকাশ বা নগদে পাঠালে আগে অর্ডার নিশ্চিত করে নিন, পরে লেনদেনের নম্বর হোয়াটসঅ্যাপে জানান। শুধু এই নম্বরেই টাকা পাঠাবেন।", acts([["ডেলিভারি, পেমেন্ট ও ফেরতের নিয়ম", D.policy]])]);
    }
    if (has(q, ["ওয়ারেন্টি", "warranty", "গ্যারান্টি", "guarantee"])) return bot(["আমাদের সব পণ্যে ১ বছরের ওয়ারেন্টি আছে।"]);
    if (has(q, ["ফেরত", "return", "রিটার্ন", "নষ্ট", "ভাঙা", "বদল", "exchange", "রিফান্ড", "refund"])) {
      return bot(["পণ্য নষ্ট থাকলে ৫ দিনের মধ্যে সহজে ফেরত দিতে পারবেন, আর ফেরতের সব খরচ আমরা বহন করব। আরও বিস্তারিত নিয়ম জানতে ফোনে কথা বলুন।", acts([["ডেলিভারি, পেমেন্ট ও ফেরতের নিয়ম", D.policy]]), callRow()]);
    }
    if (has(q, ["ঠিকানা", "address", "দোকান", "কোথায়", "কুমারখালী", "কুষ্টিয়া", "ফোন", "নম্বর", "নাম্বার", "whatsapp", "হোয়াটসঅ্যাপ", "যোগাযোগ", "contact", "ফেসবুক", "facebook", "টিকটক", "tiktok", "social"])) {
      return bot(["আমাদের দোকান: কুমারখালী, কুষ্টিয়া।", "ফোন ও হোয়াটসঅ্যাপ: " + D.telShow, acts([["📞 ফোন করুন", "tel:" + D.tel], ["WhatsApp", "https://wa.me/" + D.wa, "ast-wa", true], ["টিকটক", D.tiktok, "", true], ["ফেসবুক পেজ", D.facebook, "", true]])]);
    }
    if (has(q, ["অর্ডার", "order", "কিনব", "কিনতে", "কিনবো", "কেনা"])) {
      return bot(["অর্ডার করতে পণ্যের নিচে “WhatsApp-এ অর্ডার” বোতামে চাপ দিন, অথবা " + D.telShow + " নম্বরে ফোন করুন। নাম, পুরো ঠিকানা আর ফোন নম্বর জানাবেন। সাইটে পণ্য “অর্ডার তালিকায়” যোগ করে একসাথেও অর্ডার পাঠানো যায়।", callRow()]);
    }
    return bot(["এই প্রশ্নের সঠিক উত্তর আমার জানা নেই, ভুল বললে আপনার ক্ষতি হবে। সরাসরি ফোন বা হোয়াটসঅ্যাপে জিজ্ঞেস করুন, আমরা জানিয়ে দেব।", callRow()]);
  }

  var QUICK = [["পণ্যের দাম তালিকা", "দাম তালিকা"], ["ডেলিভারি", "ডেলিভারি"], ["টাকা দেওয়ার উপায়", "পেমেন্ট"], ["ওয়ারেন্টি", "ওয়ারেন্টি"], ["ফেরত", "ফেরত"], ["৩০০০ টাকার মধ্যে", "৩০০০ টাকার মধ্যে"], ["ঠিকানা ও যোগাযোগ", "যোগাযোগ"]];
  QUICK.forEach(function (c) {
    var b = el("button", "ast-chip", c[0]); b.type = "button";
    b.addEventListener("click", function () { me(c[0]); answer(c[1]); });
    chips.appendChild(b);
  });
  var started = false;
  function open() {
    panel.hidden = false; fab.hidden = true;
    if (!started) { started = true; bot(["আসসালামু আলাইকুম! আমি Kiam Product Bd-এর সহকারী। দাম, পণ্য, ডেলিভারি, পেমেন্ট, ওয়ারেন্টি বা ফেরত নিয়ে প্রশ্ন করতে পারেন। পণ্যের নাম (যেমন \"BL-900\" বা \"ইনফ্রারেড কুকার\") বা বাজেট (যেমন \"২০০০ টাকার মধ্যে\") লিখলেও চলবে।"]); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function shut() { panel.hidden = true; fab.hidden = false; }
  fab.addEventListener("click", open); close.addEventListener("click", shut);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) shut(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault(); var t = input.value.trim(); if (!t) return;
    input.value = ""; me(t); answer(t);
  });
})();
