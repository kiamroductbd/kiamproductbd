/* Kiam Product Bd: order list ("cart") that sends one WhatsApp message with every chosen product. No payment here, orders are confirmed on WhatsApp. */
(function () {
  var NUM = "8801571394842";
  var KEY = "kiam_order_list_v1";
  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); if (!Array.isArray(items)) items = []; } catch (e) { items = []; }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function bn(n) { try { return Number(n).toLocaleString("bn-BD"); } catch (e) { return String(n); } }
  function $(id) { return document.getElementById(id); }
  function toast(t) {
    var d = document.createElement("div");
    d.className = "toast"; d.textContent = t; d.setAttribute("role", "status");
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1800);
  }
  function find(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; }

  function message() {
    var lines = ["আসসালামু আলাইকুম, আমি এই পণ্যগুলো অর্ডার করতে চাই:"];
    var total = 0, unknown = false;
    items.forEach(function (it, i) {
      if (it.price) { total += it.price * it.qty; lines.push(bn(i + 1) + ". " + it.name + " × " + bn(it.qty) + " = " + bn(it.price * it.qty) + " টাকা"); }
      else { unknown = true; lines.push(bn(i + 1) + ". " + it.name + " × " + bn(it.qty) + " (দাম জানতে চাই)"); }
    });
    if (total) lines.push("মোট: " + bn(total) + " টাকা" + (unknown ? " (দাম জানা পণ্যের)" : ""));
    lines.push("আমার নাম ও ঠিকানা: ");
    return lines.join("\n");
  }

  function render() {
    var count = items.reduce(function (s, it) { return s + it.qty; }, 0);
    var c = $("cart-count");
    if (c) { c.textContent = bn(count); c.hidden = count === 0; }
    var box = $("cart-items");
    if (!box) return;
    box.innerHTML = "";
    if (!items.length) {
      var p = document.createElement("p");
      p.className = "cart-empty";
      p.textContent = "তালিকা এখনও খালি। পণ্যের নিচের \"তালিকায় যোগ করুন\" বোতামে চাপ দিন।";
      box.appendChild(p);
    }
    var total = 0, unknown = false;
    items.forEach(function (it) {
      if (it.price) total += it.price * it.qty; else unknown = true;
      var row = document.createElement("div");
      row.className = "cart-row";
      var name = document.createElement("div");
      name.className = "cart-name";
      name.textContent = it.name;
      var sub = document.createElement("small");
      sub.textContent = it.price ? bn(it.price) + " টাকা" : "দাম জানতে মেসেজ করুন";
      name.appendChild(sub);
      var qty = document.createElement("div");
      qty.className = "cart-qty";
      [["dec", "−", "কমান"], ["inc", "+", "বাড়ান"]].forEach(function (b, k) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.textContent = b[1]; btn.setAttribute("aria-label", it.name + " " + b[2]);
        btn.setAttribute("data-act", b[0]); btn.setAttribute("data-id", it.id);
        if (k === 1) { var n = document.createElement("span"); n.textContent = bn(it.qty); qty.appendChild(btn); qty.insertBefore(n, btn); }
        else qty.appendChild(btn);
      });
      var del = document.createElement("button");
      del.type = "button"; del.className = "cart-del"; del.textContent = "মুছুন";
      del.setAttribute("data-act", "del"); del.setAttribute("data-id", it.id);
      row.appendChild(name); row.appendChild(qty); row.appendChild(del);
      box.appendChild(row);
    });
    var t = $("cart-total");
    if (t) t.textContent = items.length ? ("মোট: " + bn(total) + " টাকা" + (unknown ? " (দাম জানা পণ্যের)" : "")) : "";
    var send = $("cart-send");
    if (send) {
      send.href = "https://wa.me/" + NUM + "?text=" + encodeURIComponent(message());
      send.hidden = !items.length;
    }
    var clr = $("cart-clear");
    if (clr) clr.hidden = !items.length;
  }

  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var id = add.getAttribute("data-id");
      var it = find(id);
      if (it) it.qty += 1;
      else items.push({ id: id, name: add.getAttribute("data-name"), price: Number(add.getAttribute("data-price")) || 0, qty: 1 });
      save(); render(); toast("অর্ডার তালিকায় যোগ হয়েছে");
      return;
    }
    var act = e.target.closest("[data-act]");
    if (act) {
      var it2 = find(act.getAttribute("data-id"));
      if (!it2) return;
      var a = act.getAttribute("data-act");
      if (a === "inc") it2.qty += 1;
      else if (a === "dec") it2.qty -= 1;
      else if (a === "del") it2.qty = 0;
      items = items.filter(function (x) { return x.qty > 0; });
      save(); render();
      return;
    }
    if (e.target.closest("#cart-open")) {
      var d = $("cart");
      if (d && d.showModal) d.showModal(); else if (d) d.setAttribute("open", "");
      return;
    }
    if (e.target.closest("#cart-clear")) { items = []; save(); render(); return; }
    if (e.target.id === "cart") e.target.close();
  });
  render();
})();
