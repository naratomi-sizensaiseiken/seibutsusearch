window.addEventListener("load",()=>{
  for(let x of MMHKD.split("\n")){
    let ary = x.split(",");
    let meshcode = calcMeshCode(Number(ary[19]), Number(ary[18]), 2);
    database[meshcode] = database[meshcode] || [];
    database[meshcode].push({
      name: fixName(ary[26]),
      year: ary[2],
      ref: "モニタリングサイト1000"
    });
  }

  for(let x of shokubutsu.split("\n")){
    let ary = x.split(",");
    let meshcode = ary[6];
    database[meshcode] = database[meshcode] || [];
    database[meshcode].push({
      name: fixName(ary[2]),
      year: ary[1],
      ref: "河川水辺の国勢調査"
    });
  }
  
  for(let x of gairai_shokubutsu.split("\n")){
    let ary = x.split(",");
    creature[ary[1]] = creature[ary[1]] || {};
    Object.assign(creature[ary[1]], {
      alien: true
    });
  }

  for(let x of yokohama.split("\n")){
    let ary = x.split(",");
    let meshcode = ary[2];
    database[meshcode] = database[meshcode] || [];
    database[meshcode].push({
      name: fixName(ary[0]),
      year: ary[1],
      ref: "横浜市内生物相調査"
    });
  }

  for(let kasen in suikei){
    let option = document.createElement("option");
    option.textContent = kasen;
    option.value = kasen;
    document.getElementById("suikei").appendChild(option);
  }
});

const map = L.map("mapcontainer", {
  center: L.latLng(34.7, 135.8),
  layers: L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.png", {
    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
    minZoom: 5,
    maxZoom: 18
  }),
  preferCanvas:true
});

setupMap();
let polygon_list = [];
let polygon_group = L.featureGroup();

//mode1が地域→生物 mode2が生物→地域
let mode;
change_mode("mode1");

function setupMap() {
  map.setView([34, 135], 7);
  L.control.layers({
    "標準地図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 5,
      maxZoom: 18
    }),
    "淡色地図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 5,
      maxZoom: 18
    }),
    "白地図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 5,
      maxZoom: 14
    }),
    "航空写真": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 2,
      maxZoom: 18
    }),
    "航空写真（2007年以降）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/nendophoto{year}/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 14,
      maxZoom: 18
    }),
    "航空写真（1988年～1990年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/gazo4/{z}/{x}/{y}.jpg", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 10,
      maxZoom: 17
    }),
    "航空写真（1984年～1986年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/gazo3/{z}/{x}/{y}.jpg", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 10,
      maxZoom: 17
    }),
    "航空写真（1979年～1983年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/gazo2/{z}/{x}/{y}.jpg", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 10,
      maxZoom: 17
    }),
    "航空写真（1974年～1978年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 10,
      maxZoom: 17
    }),
    "航空写真（1961年～1969年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 10,
      maxZoom: 17
    }),
    "宅地利用動向調査 近畿圏（2008年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki2008/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "宅地利用動向調査 近畿圏（1996年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki1996/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "宅地利用動向調査 近畿圏（1991年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki1991/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "宅地利用動向調査 近畿圏（1985年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki1985/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "宅地利用動向調査 近畿圏（1979年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki1979/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "宅地利用動向調査 近畿圏（1974年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum4bl_kinki1974/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 13,
      maxZoom: 16
    }),
    "20万分1土地利用図（1982～1983年）": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/lum200k/{z}/{x}/{y}.png", {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      minZoom: 11,
      maxZoom: 14
    }),
    // なぜか動かない
    // "川だけ地図":L.tileLayer("https://www.gridscapes.net/AllRivers/1.0.0/t/{z}/{x}/{y}.png", {
    // 	attribution: "<a href='https://www.gridscapes.net/#AllRiversAllLakesTopography' target='_blank'>川だけ地形地図 （平26情使 第964号）</a>",
    //   minZoom: 5,
    //   maxZoom: 14
    // }),
    "川と流域地図":L.tileLayer("https://tiles.dammaps.jp/ryuiki_t/1/{z}/{x}/{y}.png", {
    	attribution: "<a href='https://www.gridscapes.net/#AllRivers' target='_blank'>川だけ地図</a> | <a href='http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-W05.html' target='_blank'>国土数値情報（河川）</a>",
      minZoom: 5,
      maxZoom: 14
    })
  }, null, { collapsed: false }).addTo(map);

  L.control.mousePosition({
    position: 'bottomleft', // ’bottomleft’,’bottomright’,’topleft’,’topright’
    numDigits: 7
  }).addTo(map);
}

function search_from_city() {
  let citycode = document.getElementById("city").value;
  if (citycode == "all") {
    let prefcode = document.getElementById('pref').value;
    output_table(cityToMesh[prefcode]);
  } else {
    output_table(cityToMesh[citycode]);
  }
}

function search_from_meshcode() {
  output_table([document.getElementById("meshcode").value]);
}

function search_from_suikei() {
  output_table(suikei[document.getElementById("suikei").value]);
}

function output_table(meshlist) {
  //let selectedYear = document.getElementById("year").value == "all" ? "all" : document.getElementById("year").value * 10 + 1940;
  let selectedYear = [...document.getElementsByName("year")].flatMap(x => x.checked?[x.value]:[]);
  let selectedPlace = [...document.getElementsByName("place")].flatMap(x => x.checked?[x.value]:[]);
  let selectedType = [...document.getElementsByName("type")].flatMap(x => x.checked?[x.value]:[]);
  console.log(selectedYear, selectedPlace, selectedType);

  let output = meshlist.map(x => database[x])
  let list = {}; // 生物ごとの発見年の集合
  for (let mesh of output) {
    for (let j of mesh) {
      // if (!(j.name in creature)) break;
      // if(creature[j.name].type in selectedType
      // && (selectedYear == "all" || (selectedYear<=j.year && j.year < selectedYear+10))
      // && getPlace(j.name).filter(x=> x in selectedPlace)){
      if(selectedType.length < TYPE_LIST.length && 
      !(j.name in creature && "type" in creature[j.name] && selectedType.includes(creature[j.name].type))){
        continue;
      }

      if(selectedPlace.length < PLACE_NAME.length && 
      !(j.name in creature && "place" in creature[j.name] && selectedPlace.some(x=>creature[j.name].place[x]))){
        continue;
      }
      list[j.name] = list[j.name] || {year: [], ref: []};
      list[j.name].year.push(j.year);
      list[j.name].ref.push(j.ref);
      // list[j.name].push(year);
      // }
    }
  }
  console.log(list);

  let year_list = [1950, 1960, 1970, 1980, 1990, 2000, 2010];
  let year_count = {
    yes: Object.fromEntries(year_list.map(x => [x, 0])),
    possibility: Object.fromEntries(year_list.map(x => [x, 0]))
  };
  let place_count = Object.fromEntries(PLACE_NAME.map(x => [x, 0]));
  let table = document.getElementById("outputtable");
  table.innerHTML = "<tr id='exp'><th>名称</th><th>地図</th><th>種類</th>"
    + "<th>外来/在来</th><th>出典</th>"
    + "<th>1950s</th><th>1960s</th><th>1970s</th><th>1980s</th><th>1990s</th><th>2000s</th><th>2010s</th>"
    + PLACE_NAME.map(x => "<th>" + x + "</th>").join("")
    + "</tr>";
  let pair = Object.entries(list).sort((x, y) => ((x[0] > y[0]) - (x[0] < y[0])));
  console.log(pair);
  for(const [name, data] of pair){
    const thisCreature = creature[name]??{};

    //名称の表示
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    let anchor = document.createElement("a");
    anchor.textContent = name;
    anchor.href = "https://ja.wikipedia.org/wiki/" + name;

    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    th.appendChild(anchor);

    if ("scientific" in thisCreature) th.innerHTML += "<br>" + thisCreature.scientific;
    tr.appendChild(th);

    // 地図アイコンの表示
    let td = document.createElement("td");
    let button = document.createElement("button");
    button.setAttribute("onclick", `showMap("${name}")`);
    button.className = "mapbutton";
    let img = document.createElement("img");
    img.src = "mapicon.svg";
    img.style.height = "32px";
    img.style.width = "32px";
    button.appendChild(img);
    td.appendChild(button);
    tr.appendChild(td);

    //種類の表示
    td = document.createElement("td");
    if ("type" in thisCreature) {
      td.innerHTML = thisCreature.type.replace("・", "<br>");
      td.className = {
        "哺乳類": "honyurui",
        "貝類": "kairui",
        "淡水魚類": "tansuigyorui",
        "両生類・爬虫類": "ryoseiruihachurui",
        "昆虫類": "konchurui",
        "鳥類": "chorui",
        "植物": "shokubutsu"
      }[thisCreature.type];
    }
    tr.appendChild(td);

    //外来種関係の表示
    td = document.createElement("td");
    if (thisCreature.alien) {
      td.innerHTML = thisCreature.origin?thisCreature.origin.replace("、", "<br>"):"外来種";
      td.className = "gairai";
      if(thisCreature.specify)td.innerHTML += "<br>" + thisCreature.specify;
      if(thisCreature.distribution)td.innerHTML += "<br>" + thisCreature.distribution;
      tr.appendChild(td);
    } else {
      td.textContent = "在来種";
      td.className = "zairai";
      tr.appendChild(td);
    }

    //出典の表示
    td = document.createElement("td");
    td.innerHTML = [...new Set(data.ref)].join("<br>");
    tr.appendChild(td);

    // 年代ごとの存在の是非の表示
    for (let y of year_list) {
      td = document.createElement("td");
      if (data.year.some(x => y <= x && x < y + 10)) {
        td.textContent = "○";
        td.className = "yes";
        year_count.yes[y]++;
        year_count.possibility[y]++;
      } else if (data.year.some(x => y <= x) && (!thisCreature.alien)) {
        year_count.possibility[y]++;
        if (document.getElementById("sankaku").value == "true") {
          td.textContent = "△";
          td.className = "possibility";
        } else {
          td.textContent = "×";
          td.className = "no";
        }
      } else {
        td.textContent = "×";
        td.className = "no";
      }
      tr.appendChild(td);
    }

    // 生息場所の表示
    if (thisCreature.place) {
      for (let placeName of PLACE_NAME) {
        td = document.createElement("td");
        if (thisCreature.place[placeName]) {
          td.textContent = "○";
          td.className = "yes2";
          place_count[placeName]++;
        } else {
          td.textContent = "×";
          td.className = "no2";
        }
        tr.appendChild(td);
      }
    } else {
      tr.innerHTML += PLACE_NAME.map(x => "<td></td>").join("");
    }


    //tableに行を追加
    table.appendChild(tr);
  }


  //ソート済み生息地
  let place_count_sorted = Object.keys(place_count).map(y => [y, place_count[y]]).sort((p, q) => q[1] - p[1]);
  console.log(place_count_sorted);

  // 総数の表示
  let tr = document.createElement("tr");
  tr.innerHTML = "<th colspan=\"2\">合計</th><td>" + Object.keys(list).length + "種</td><td></td><td></td>";
  for (let y of year_list) {
    let td = document.createElement("td");
    td.textContent = year_count.yes[y] + "種";
    tr.appendChild(td);
  }
  for (let p of PLACE_NAME) {
    let td = document.createElement("td");
    td.textContent = place_count[p] + "種";
    tr.appendChild(td);
  }

  table.appendChild(tr);

  tr = document.createElement("tr");
  tr.innerHTML = "<th colspan=\"2\">合計(△を入れた場合)</th><td>" + Object.keys(list).length + "種</td><td></td><td></td>";
  for (let y of year_list) {
    let td = document.createElement("td");
    td.textContent = year_count.possibility[y] + "種";
    tr.appendChild(td);
  }
  for (let p in place_count_sorted) {
    let td = document.createElement("td");
    td.textContent = (Number(p) + 1) + "位:" + place_count_sorted[p][0] + ":" + place_count_sorted[p][1] + "種";
    tr.appendChild(td);
  }

  table.appendChild(tr);

  //土地利用表示のための下準備
  let gio_years = [1976, 1987, 1997, 2006];
  let gio_usages = ["田", "その他の農用地", "荒地", "森林","河川地及び湖沼", "海浜", "海水域", "建物用地", "幹線交通用地",  "その他の用地"];
  let gio_output = {}

  console.log(gio_output);
  for(let name of gio_usages){
    gio_output[name] = {};
  }

  for(let mesh of meshlist){
    mesh = String(mesh).substring(0, 6);
    let data = usage[mesh]
    for(let year of gio_years){
      for(let name in data[year]){
        let area = +data[year][name];
        if(["不明", "解析範囲外"].includes(name)) continue;
        if(["畑", "果樹園", "その他の樹木畑"].includes(name))name = "その他の農用地";
        if(name == "ゴルフ場") name = "その他の用地";
        if(["建物用地Ａ", "建物用地Ｂ"].includes(name)) name = "建物用地";
        if(["河川地Ａ", "河川地Ｂ", "湖沼", "内水地"].includes(name)) name = "河川地及び湖沼";
        if(!(year in gio_output[name])) gio_output[name][year] = 0;
        gio_output[name][year] += area;
      }
   }
  }

   //土地利用の表示のための隙間を表示
  tr = document.createElement("tr");
  tr.style.height = "10px";
  table.appendChild(tr);

  tr = document.createElement("tr");
  tr.innerHTML = "<th>土地利用[km²]</th><td></td><td></td><td></td><td></td><th>1976</th><th>1987</th><th>1997</th><th>2006</th>";
  table.appendChild(tr);

  for(let gio in gio_output){
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.textContent = gio;
    tr.appendChild(td);
    tr.innerHTML += "<td></td><td></td><td></td><td></td>";
    for(let gio_y of gio_years){
      td = document.createElement("td");
      td.textContent = !isNaN(gio_output[gio][gio_y])?Math.round(gio_output[gio][gio_y]/1000000*100)/100:"?";
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  //関係図を作成

  let pairPlace = {};
  for(let [name, _] of pair){
    if(!(name in creature && "place" in creature[name])) continue;
    let pairBianry = JSON.stringify(creature[name].place).replaceAll("false", "0").replaceAll("true", "1").replaceAll(/[^01]/g,"");
    if(pairBianry.length==16)pairBianry+="0";
    if(!(pairBianry in pairPlace)) pairPlace[pairBianry] = [];
    pairPlace[pairBianry].push(name);
  }
  console.log(pairPlace);

  // let nodes = new vis.DataSet(pair.flatMap(x=>x[0] in creature && "place" in creature[x[0]]?[{
  //   label:x[0],
  //   id:x[0],
  //   shape:"dot",
  //   color: "type" in creature[x[0]]? {
  //     "哺乳類": "#f4a460",
  //     "貝類": "#5f9ea0",
  //     "淡水魚類": "#6495ed",
  //     "両生類・爬虫類": "#9acd32",
  //     "昆虫類": "#bc8f8f",
  //     "鳥類": "#b0c4de",
  //     "植物": "#98fb98"
  //   }[creature[x[0]].type]: "white",
  //   size: 5
  // }]:[]).concat(...PLACE_NAME.map(x=>({
  //   label:x,
  //   id:x,
  //   shape:"box",
  //   color:"#5bb",
  //   font: { size:30 }
  // }))));
  let nodes = new vis.DataSet([...Object.entries(pairPlace).map(([bin, names])=>({
    label: "",
    id: bin,
    shape: "dot",
    color: "dimgray",
    size: 3*Math.sqrt(names.length),
    title: (()=>{
      let div = document.createElement("div");
      div.innerHTML = names.join("<br>");
      return div;
    })()
  })), ...PLACE_NAME.map(x=>({
    label:x,
    id:x,
    shape:"box",
    color:"#5bb",
    font: { size:15 }
  }))]);
  // let edges = new vis.DataSet(pair.flatMap(x=>x[0] in creature && "place" in creature[x[0]]?
  //   PLACE_NAME.flatMap(y=>creature[x[0]].place[y]?[{
  //     from: x[0],
  //     to: y,
  //   }]:[]):[]));
  let edges = new vis.DataSet(Object.keys(pairPlace).flatMap(
    str=>[...str].flatMap((value, index)=>
      value=="1"?[{
        from: str,
        to: PLACE_NAME[index]
      }]:[]
    )
  ));
  console.log(nodes, edges);
  let container = document.getElementById("network");
  let opt = {
    "edges": {
      "smooth": false
    },
    "nodes": {
      "shadow": true
    },
    "physics": {
      "maxVelocity": 5,
      "minVelocity": 0.08
    }
  };
  // opt = {
  //   "nodes": {
  //     "shadow": true
  //   }
  // };
  let network = new vis.Network(container, {nodes, edges}, opt);
}

function prefchange() {
  let prefcode = document.getElementById('pref').value;
  fetch("https://www.land.mlit.go.jp/webland/api/CitySearch?area=" + prefcode)
    .then(response => response.json())
    .then(json => {
      let citydata = json.data;
      let city = document.getElementById("city");
      city.innerHTML = "<option style=\"display:none;\">市町村</option>";
      for (let i in citydata) {
        let option = document.createElement("option");
        option.value = citydata[i].id;
        option.textContent = citydata[i].name;
        if (i != citydata.length - 1 && citydata[Number(i)].name.slice(-1) != "区" && citydata[Number(i) + 1].name.slice(-1) == "区") {
          option.disabled = "disabled";
        }
        city.appendChild(option);
      }
      let option = document.createElement("option");
      option.value = "all";
      option.textContent = "全域";
      city.appendChild(option);
    });
}






function use_map(datalist) {
  //表示状態を初期化
  while (polygon_list.length != 0) {
    map.removeLayer(polygon_list.shift());
  }
  let table = document.getElementById("output_creature_table");
  table.textContent = "";
  let name = document.getElementById("seibutsu").value;
  let thisCreature = creature[name];

  table.innerHTML = "<tr id='exp'><th>名称</th>"+ PLACE_NAME.map(x => "<th>" + x + "</th>").join("")+ "</tr>";

  //名称の表示
  let tr = document.createElement("tr");
  let th = document.createElement("th");
  let anchor = document.createElement("a");
  anchor.textContent = name;
  anchor.href = "https://ja.wikipedia.org/wiki/" + name;

  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  th.appendChild(anchor);

  if ("scientific" in thisCreature) th.innerHTML += "<br>" + thisCreature.scientific;
  tr.appendChild(th);

  // 生息場所の表示
  if (thisCreature.place) {
    for (let placeName of PLACE_NAME) {
      td = document.createElement("td");
      if (thisCreature.place[placeName]) {
        td.textContent = "○";
        td.className = "yes2";
      } else {
        td.textContent = "×";
        td.className = "no2";
      }
      tr.appendChild(td);
    }
  }else{
    tr.innerHTML += PLACE_NAME.map(x => "<td></td>").join("");
  }
  //tableに行を追加
  table.appendChild(tr);

  //必要なデータのみにしぼる
  /*datalistは連想配列で, メッシュコードごとのkeyに対して, valueにarrayが入り, [{name, year, ref},{name, year, ref}... ]という形のデータ
  let list = [];
  for (let i of datalist) {
    if (!list.some(x => x[0] == i.meshcode)) {
      list.push([i.meshcode, []]);
    }
    let obj = {};
    if ("year" in i) obj.year = i.year;
    if ("month" in i) obj.month = i.month;
    list.find(x => x[0] == i.meshcode)[1].push(obj);
  }*/

  //方眼と文字の表示？
  let hoganFlg = document.getElementById("hogan").value == "true";
  let bangoFlg = document.getElementById("bango").value == "true";
  //方眼の表示
  if (hoganFlg || bangoFlg) {
    for (let meshcode of Object.keys(database)) {
      console.log(meshcode);
      if(meshcode.length!=6)continue;
      if(hoganFlg){
        let arealatlons = [[meshcode2latlng.second(meshcode).north, meshcode2latlng.second(meshcode).east], [meshcode2latlng.second(meshcode).south, meshcode2latlng.second(meshcode).east],
        [meshcode2latlng.second(meshcode).south, meshcode2latlng.second(meshcode).west], [meshcode2latlng.second(meshcode).north, meshcode2latlng.second(meshcode).west]];
        let polygon = L.polygon(arealatlons, { color: "black", weight: 1, fill: false });
        polygon_list.push(polygon);
        polygon.addTo(map);
      }
      if(bangoFlg){
        let divIcon = L.divIcon({
          html: meshcode,
          className: 'divicon3',
          iconSize: [0, 0]
        });
        let posMarker = L.marker([meshcode2latlng.second(meshcode).north, meshcode2latlng.second(meshcode).west], { icon: divIcon }).addTo(map);
        polygon_list.push(posMarker);
      }
    }
  }


  //色付きのセルをまとめる
  polygon_group = L.featureGroup();

  for (let meshcode in datalist) {
    let newestYear = Math.max(...datalist[meshcode].filter(x => "year" in x).map(x => x.year));
    let color;
    if (newestYear >= 2000) {
      color = "#9f0";
    } else if (newestYear >= 1990) {
      color = "#fb0";
    } else if (newestYear >= 1980) {
      color = "#f30";
    } else if (newestYear >= 1970) {
      color = "#f0c";
    } else {
      color = "#70f";
    }

    let arealatlons = [[meshcode2latlng.second(meshcode).north, meshcode2latlng.second(meshcode).east], [meshcode2latlng.second(meshcode).south, meshcode2latlng.second(meshcode).east],
    [meshcode2latlng.second(meshcode).south, meshcode2latlng.second(meshcode).west], [meshcode2latlng.second(meshcode).north, meshcode2latlng.second(meshcode).west]];
    if(meshcode.length!=6){continue;}
    let polygon = L.polygon(arealatlons, { color: "black", weight: 0, opacity: 0.5, fill: true, fillColor: color, fillOpacity: 0.5 });

    polygon_group.addLayer(polygon);
    polygon_list.push(polygon);


  }
  polygon_group.addTo(map);
}







let until = 2021;
function search_from_seibutsu() {
  let name = document.getElementById("seibutsu").value;
  let output = {};
  for(let mesh in database){
    for(let data of database[mesh]){
      if(data.name == name){
        output[mesh] = output[mesh] || [];
        output[mesh].push(data);
      }
    }
  }
  //let output = DATABASE.filter(x=>x.name==name&&Number(x.year)<=until);
  use_map(output);
}

function search_from_gakumei() {
  // let name = name_to_gakumei(document.getElementById("gakumei_name").value);
  // let output = DATABASE.filter(x=>x.name==name&&Number(x.year)<=until);
  // use_map(output);
}

function change_until() {
  until = Number(document.getElementById("until").value)
  document.getElementById("until_output").textContent = until + "年まで";
  search_from_seibutsu();
}

function change_mode(changeto) {
  if (mode != changeto) {
    mode = changeto;
    if (mode == "mode1") {
      document.getElementById("mode1").style.display = "inherit";
      document.getElementById("mode2").style.display = "none";
      document.getElementById("mode1button").classList.add("checked");
      document.getElementById("mode2button").classList.remove("checked");
    } else {
      document.getElementById("mode1").style.display = "none";
      document.getElementById("mode2").style.display = "inherit";
      document.getElementById("mode1button").classList.remove("checked");
      document.getElementById("mode2button").classList.add("checked");
      map.invalidateSize();
    }
  }
}


function showMap(name) {
  change_mode("mode2");
  document.getElementById("seibutsu").value = name;
  search_from_seibutsu();
}

function name_to_gakumei(input) {
  let ary = gakumei_list.find(x => x[0].toLowerCase() == input.toLowerCase())
  if (ary) {
    return ary[1];
  } else {
    return "";
  }
}

function gakumei_to_name(input) {
  let ary = gakumei_list.find(x => x[1] == input)
  if (ary) {
    return ary[0];
  } else {
    return "";
  }
}

function name_to_place(input) {
  let ary = PLACE.find(x => x[0] == input)
  if (ary) {
    return ary[1];
  } else {
    return null;
  }
}

function check_all_place() {
  for (let i of document.getElementsByName("place")) {
    i.checked = true;
  }
}

function uncheck_all_place() {
  for (let i of document.getElementsByName("place")) {
    i.checked = false;
  }
}

function check_all_year() {
  for (let i of document.getElementsByName("year")) {
    i.checked = true;
  }
}

function uncheck_all_year() {
  for (let i of document.getElementsByName("year")) {
    i.checked = false;
  }
}

function check_all_type() {
  for (let i of document.getElementsByName("type")) {
    i.checked = true;
  }
}

function uncheck_all_type() {
  for (let i of document.getElementsByName("type")) {
    i.checked = false;
  }
}
