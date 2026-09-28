/* VIZAL — interactive algorithm visualizers */
(() => {
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const delayFromSpeed = value => Math.max(55, 680 - Number(value) * 6.2);

  // ---------- SORTING ----------
  const sortStage = $("sort-array");
  if (sortStage) {
    let values = [38,72,51,88,29,64,43,91,57];
    const initial = [...values];
    let running = false, cancelled = false;

    function renderSort(active = [], sorted = []) {
      sortStage.innerHTML = "";
      values.forEach((value, i) => {
        const wrap = document.createElement("div");
        wrap.className = "bar-wrap";
        const bar = document.createElement("div");
        bar.className = "bar" + (active.includes(i) ? " active" : "") + (sorted.includes(i) ? " sorted" : "");
        bar.style.height = `${Math.max(18, value * 2.55)}px`;
        bar.title = `Value ${value}`;
        const val = document.createElement("span"); val.className = "bar-value"; val.textContent = value;
        const controls = document.createElement("div"); controls.className = "bar-controls";
        const up = document.createElement("button"); up.textContent = "↑"; up.title = "Increase value";
        const down = document.createElement("button"); down.textContent = "↓"; down.title = "Decrease value";
        up.onclick = () => { if (!running) { values[i] = Math.min(100, values[i] + 1); renderSort(); } };
        down.onclick = () => { if (!running) { values[i] = Math.max(1, values[i] - 1); renderSort(); } };
        controls.append(up, down); wrap.append(bar,val,controls); sortStage.append(wrap);
      });
    }
    renderSort();

    const status = $("sort-status");
    const setStatus = t => status.textContent = t;

    function swapsForBubble() {
      const a = [...values], steps = [];
      for (let end=a.length-1; end>0; end--) {
        let swapped=false;
        for(let j=0;j<end;j++){ steps.push({a:j,b:j+1}); if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];swapped=true;steps.push({swap:[j,j+1]});}}
        if(!swapped) break;
      }
      return {a,steps};
    }
    function insertionSteps() {
      const a=[...values],steps=[];
      for(let i=1;i<a.length;i++){let j=i;while(j>0){steps.push({a:j-1,b:j});if(a[j-1]<=a[j])break;[a[j-1],a[j]]=[a[j],a[j-1]];steps.push({swap:[j-1,j]});j--;}}
      return {a,steps};
    }
    function selectionSteps() {
      const a=[...values],steps=[];
      for(let i=0;i<a.length-1;i++){let m=i;for(let j=i+1;j<a.length;j++){steps.push({a:m,b:j});if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];steps.push({swap:[i,m]});}}
      return {a,steps};
    }
    function mergeSteps() {
      const a=[...values],steps=[];
      function merge(l,m,r){let left=a.slice(l,m+1),right=a.slice(m+1,r+1),i=0,j=0,k=l;while(i<left.length&&j<right.length){steps.push({a:l+i,b:m+1+j});if(left[i]<=right[j])a[k++]=left[i++];else a[k++]=right[j++];steps.push({write:[l,r]});}while(i<left.length)a[k++]=left[i++];while(j<right.length)a[k++]=right[j++];}
      function rec(l,r){if(l>=r)return;const m=Math.floor((l+r)/2);rec(l,m);rec(m+1,r);merge(l,m,r)} rec(0,a.length-1); return {a,steps};
    }
    function quickSteps() {
      const a=[...values],steps=[];
      function partition(lo,hi){const pivot=a[hi];let i=lo;for(let j=lo;j<hi;j++){steps.push({a:j,b:hi});if(a[j]<pivot){[a[i],a[j]]=[a[j],a[i]];steps.push({swap:[i,j]});i++;}}[a[i],a[hi]]=[a[hi],a[i]];steps.push({swap:[i,hi]});return i}
      function q(l,r){if(l>=r)return;const p=partition(l,r);q(l,p-1);q(p+1,r)} q(0,a.length-1);return {a,steps};
    }

    async function playSort() {
      if(running) return;
      running=true;cancelled=false;$("sort-play").textContent="■ Stop";
      const alg=$("sort-algorithm").value, speed=$("sort-speed").value;
      const fn={"Bubble Sort":swapsForBubble,"Insertion Sort":insertionSteps,"Selection Sort":selectionSteps,"Merge Sort":mergeSteps,"Quick Sort":quickSteps}[alg];
      const result=fn(); setStatus(`${alg} is running…`);
      for(const step of result.steps){
        if(cancelled) break;
        if(step.a){renderSort([step.a,step.b]);await sleep(delayFromSpeed(speed));}
        if(step.swap){[values[step.swap[0]],values[step.swap[1]]]=[values[step.swap[1]],values[step.swap[0]]];renderSort(step.swap);await sleep(delayFromSpeed(speed));}
        if(step.write){values=[...values];renderSort();await sleep(delayFromSpeed(speed)/2);}
      }
      if(!cancelled){values=result.a;renderSort([],values.map((_,i)=>i));setStatus(`${alg} complete — all elements sorted.`)}else{renderSort();setStatus("Stopped — press play to run again.")}
      running=false;$("sort-play").textContent="→ Play";
    }

    $("sort-play").onclick=()=>{if(running){cancelled=true}else playSort()};
    $("sort-reset").onclick=()=>{if(running){cancelled=true;return}values=[...initial];renderSort();setStatus("Reset to the original array.")};
    $("sort-randomize").onclick=()=>{if(running)return;values=Array.from({length:Math.min(14,Math.max(4,values.length))},()=>Math.floor(Math.random()*90)+10);renderSort();setStatus("Randomized — make it yours.")};
    $("sort-push").onclick=()=>{if(running||values.length>=14)return;values.push(Math.max(1,Math.min(100,Number($("new-value").value)||50)));renderSort();};
    $("sort-pop").onclick=()=>{if(running||values.length<=2)return;values.pop();renderSort();};
  }

  // ---------- SEARCHING ----------
  const searchStage = $("search-array");
  if (searchStage) {
    let values=[12,42,67,23,89,34,55,18,76], initial=[...values], running=false,cancelled=false;
    const status=$("search-status"), setStatus=t=>status.textContent=t;
    function render(active=[],found=[],dim=[]) {
      searchStage.innerHTML="";
      values.forEach((value,i)=>{
        const wrap=document.createElement("div");wrap.className="bar-wrap";
        const bar=document.createElement("div");bar.className="bar"+(active.includes(i)?" active":"")+(found.includes(i)?" found":"");
        bar.style.height=`${Math.max(18,value*2.55)}px`;if(dim.includes(i))bar.style.opacity=".28";
        const val=document.createElement("span");val.className="bar-value";val.textContent=value;
        const controls=document.createElement("div");controls.className="bar-controls";
        const up=document.createElement("button");up.textContent="↑";const down=document.createElement("button");down.textContent="↓";
        up.onclick=()=>{if(!running){values[i]=Math.min(100,value+1);render()}};down.onclick=()=>{if(!running){values[i]=Math.max(1,value-1);render()}};
        controls.append(up,down);wrap.append(bar,val,controls);searchStage.append(wrap);
      });
    }
    render();

    async function playSearch(){
      if(running)return;running=true;cancelled=false;$("search-play").textContent="■ Stop";
      const target=Number($("search-target").value), speed=$("search-speed").value, alg=$("search-algorithm").value;
      let found=-1;
      if(alg==="Linear Search"){
        setStatus(`Looking for ${target} from left to right…`);
        for(let i=0;i<values.length;i++){if(cancelled)break;render([i]);await sleep(delayFromSpeed(speed));if(values[i]===target){found=i;break}}
      }else{
        const indexed=values.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);
        let lo=0,hi=indexed.length-1;
        setStatus("Binary Search uses a sorted working copy.");
        while(lo<=hi&&!cancelled){const mid=Math.floor((lo+hi)/2);const candidate=indexed[mid];render([candidate.i],[],indexed.slice(0,lo).concat(indexed.slice(hi+1)).map(x=>x.i));await sleep(delayFromSpeed(speed));if(candidate.v===target){found=candidate.i;break}if(candidate.v<target)lo=mid+1;else hi=mid-1}
      }
      if(cancelled){setStatus("Stopped — press play to run again.");render()}
      else if(found>=0){render([found],[found]);setStatus(`Found ${target} at position ${found+1}.`)}
      else{setStatus(`${target} was not found in the array.`);render()}
      running=false;$("search-play").textContent="→ Play";
    }
    $("search-play").onclick=()=>{if(running)cancelled=true;else playSearch()};
    $("search-reset").onclick=()=>{cancelled=true;running=false;values=[...initial];render();setStatus("Reset to the original array.");$("search-play").textContent="→ Play"};
    $("search-randomize").onclick=()=>{if(running)return;values=Array.from({length:Math.min(14,Math.max(4,values.length))},()=>Math.floor(Math.random()*90)+10);render();setStatus("Randomized — choose a target.")};
    $("search-push").onclick=()=>{if(running||values.length>=14)return;values.push(Math.max(1,Math.min(100,Number($("search-new-value").value)||50)));render()};
    $("search-pop").onclick=()=>{if(running||values.length<=2)return;values.pop();render()};
  }

  // ---------- PATHFINDER ----------
  const grid=$("path-grid");
  if(grid){
    const rows=15,cols=25;let start={r:7,c:4},end={r:7,c:20},mode="wall",running=false,cancelled=false,mouseDown=false;
    const cells=[];
    function key(r,c){return `${r}-${c}`}
    function makeGrid(){
      grid.innerHTML="";
      for(let r=0;r<rows;r++){cells[r]=[];for(let c=0;c<cols;c++){const cell=document.createElement("div");cell.className="path-cell";cell.dataset.r=r;cell.dataset.c=c;cell.setAttribute("role","gridcell");
        cell.onmousedown=e=>{e.preventDefault();mouseDown=true;handleCell(r,c)};cell.onmouseenter=()=>{if(mouseDown&&mode==="wall")toggleWall(r,c)};
        grid.append(cell);cells[r][c]=cell;}}
      document.onmouseup=()=>mouseDown=false;paint();
    }
    function paint(){for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const el=cells[r][c];el.className="path-cell";if(r===start.r&&c===start.c)el.classList.add("start");else if(r===end.r&&c===end.c)el.classList.add("end");}}
    function toggleWall(r,c){if((r===start.r&&c===start.c)||(r===end.r&&c===end.c))return;cells[r][c].classList.toggle("wall")}
    function handleCell(r,c){if(running)return;if(mode==="wall")toggleWall(r,c);else if(mode==="start"){if(!(r===end.r&&c===end.c))start={r,c};paint()}else if(mode==="end"){if(!(r===start.r&&c===start.c))end={r,c};paint()}}
    makeGrid();
    document.querySelectorAll(".tool-chip").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".tool-chip").forEach(b=>b.classList.remove("active"));btn.classList.add("active");mode=btn.dataset.mode});
    $("path-clear-walls").onclick=()=>{if(running)return;cells.flat().forEach(c=>c.classList.remove("wall","visited","route"));paint();setStatus("Walls cleared.")};
    const status=$("path-status"),setStatus=t=>status.textContent=t;
    function neighbors(n){return [[1,0],[-1,0],[0,1],[0,-1]].map(([dr,dc])=>({r:n.r+dr,c:n.c+dc})).filter(n=>n.r>=0&&n.r<rows&&n.c>=0&&n.c<cols&&!cells[n.r][n.c].classList.contains("wall"))}
    async function playPath(){
      if(running)return;running=true;cancelled=false;$("path-play").textContent="■ Stop";cells.flat().forEach(c=>c.classList.remove("visited","route"));
      const speed=$("path-speed").value,alg=$("path-algorithm").value, queue=alg==="BFS"?[start]:[start], seen=new Set([key(start.r,start.c)]), prev=new Map();let found=false;
      setStatus(`${alg} is exploring…`);
      while(queue.length&&!cancelled){const cur=alg==="BFS"?queue.shift():queue.pop();if(cur.r===end.r&&cur.c===end.c){found=true;break}
        for(const n of neighbors(cur)){const k=key(n.r,n.c);if(seen.has(k))continue;seen.add(k);prev.set(k,key(cur.r,cur.c));queue.push(n);if(!(n.r===end.r&&n.c===end.c))cells[n.r][n.c].classList.add("visited")}
        await sleep(delayFromSpeed(speed));
      }
      if(!cancelled&&found){let k=key(end.r,end.c),path=[];while(k!==key(start.r,start.c)){const [r,c]=k.split("-").map(Number);path.push([r,c]);k=prev.get(k)}path.reverse();for(const [r,c] of path){cells[r][c].classList.remove("visited");cells[r][c].classList.add("route");await sleep(Math.max(35,delayFromSpeed(speed)/2))}setStatus(`${alg} found a path with ${path.length} steps.`)}
      else if(!cancelled)setStatus("No path found — try removing a few walls.");else setStatus("Stopped — press find path to run again.");
      running=false;$("path-play").textContent="→ Find path";
    }
    $("path-play").onclick=()=>{if(running)cancelled=true;else playPath()};
    $("path-reset").onclick=()=>{cancelled=true;running=false;start={r:7,c:4};end={r:7,c:20};makeGrid();setStatus("Grid reset.");$("path-play").textContent="→ Find path"};
  }
})();