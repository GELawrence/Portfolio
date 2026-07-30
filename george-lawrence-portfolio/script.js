// Reveal-on-scroll: one consistent motion behaviour, everywhere.
var revealEls = document.querySelectorAll('[data-reveal]');
var revealObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('in-view'); revealObs.unobserve(e.target); }
  });
}, {threshold:0.15});
revealEls.forEach(function(el){ revealObs.observe(el); });

// Flip-board: steps a tick column through each state directly in JS
// (rather than relying on CSS animation-delay timing), so it reliably
// lands on "delivered" every time. Fires once, on scroll into view.
var flipReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var flipObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    var inners = e.target.querySelectorAll('.flip-inner');
    inners.forEach(function(el, i){
      if(flipReduceMotion){ el.style.transform = 'translateY(-45px)'; return; }
      var rowDelay = i * 260;
      var step = 0;
      setTimeout(function advance(){
        step++;
        el.style.transform = 'translateY(-' + (step * 15) + 'px)';
        if(step < 3){ setTimeout(advance, 420); }
      }, rowDelay);
    });
    flipObs.unobserve(e.target);
  });
}, {threshold:0.4});
document.querySelectorAll('.flip-rows').forEach(function(el){ flipObs.observe(el); });

// Kinetic count-up for stat blocks — fires once, respects reduced motion.
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function formatNum(v, decimals, suffix){
  var s = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-GB');
  return s + (suffix || '');
}
var countObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    var groupEls = e.target.querySelectorAll('[data-count]');
    groupEls.forEach(function(el){
      if(el.dataset.static){ el.textContent = el.dataset.static; return; }
      var from = parseFloat(el.dataset.from);
      var to = parseFloat(el.dataset.to);
      var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      var suffix = el.dataset.suffix || '';
      if(reduceMotion){ el.textContent = formatNum(to, decimals, suffix); return; }
      var start = null; var duration = 2200;
      function step(ts){
        if(!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = from + (to - from) * eased;
        el.textContent = formatNum(val, decimals, suffix);
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    countObs.unobserve(e.target);
  });
}, {threshold:0.4});
document.querySelectorAll('[data-count-group]').forEach(function(el){ countObs.observe(el); });
