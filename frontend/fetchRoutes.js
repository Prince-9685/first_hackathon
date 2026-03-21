const fs = require('fs');

const NODE_POSITIONS = {
  'Sindhi Camp': [26.9240, 75.7997],
  'MI Road': [26.9155, 75.8043],
  'Ajmeri Gate': [26.9157, 75.8189],
  'Badi Choupad': [26.9239, 75.8275],
  'SMS Hospital': [26.9044, 75.8143],
  'Rambagh Circle': [26.8973, 75.8078],
  'C-Scheme': [26.9080, 75.7950],
  'MNIT Jaipur': [26.8631, 75.8116],
  'World Trade Park': [26.8273, 75.8075],
  'Rajasthan University': [26.8858, 75.8186],
  'Jhalana': [26.8524, 75.8239],
  'Vidhyadhar Nagar': [26.9538, 75.7725],
  'Mansarovar': [26.8549, 75.7603],
  'Vaishali Nagar': [26.9126, 75.7423],
  'Jhotwara': [26.9467, 75.7380],
  'Raja Park': [26.8920, 75.8273],
  'Tonk Road': [26.8500, 75.8000],
  'Pratap Nagar': [26.8122, 75.8198],
  'Sanganer': [26.8208, 75.7951],
  'Malviya Nagar': [26.8530, 75.8047],
  'Civil Lines': [26.9055, 75.7831]
};

const MAIN_EDGES = [
  ['Sindhi Camp', 'MI Road'],
  ['MI Road', 'Ajmeri Gate'],
  ['Ajmeri Gate', 'Badi Choupad'],
  ['Sindhi Camp', 'C-Scheme'],
  ['C-Scheme', 'Rambagh Circle'],
  ['Rambagh Circle', 'SMS Hospital'],
  ['SMS Hospital', 'Badi Choupad'],
  ['Ajmeri Gate', 'SMS Hospital'],
  ['MI Road', 'C-Scheme']
];

const BACKGROUND_EDGES = [
  ['Vidhyadhar Nagar', 'Sindhi Camp'],
  ['Vaishali Nagar', 'Civil Lines'],
  ['Jhotwara', 'Vidhyadhar Nagar'],
  ['Civil Lines', 'C-Scheme'],
  ['Rambagh Circle', 'Raja Park'],
  ['Tonk Road', 'Malviya Nagar'],
  ['Mansarovar', 'Tonk Road'],
  ['Sanganer', 'Pratap Nagar'],
  ['Malviya Nagar', 'Pratap Nagar'],
  ['SMS Hospital', 'Raja Park'],
  ['Vaishali Nagar', 'Mansarovar'],
  ['Rajasthan University', 'MNIT Jaipur'],
  ['MNIT Jaipur', 'Jhalana'],
  ['Jhalana', 'World Trade Park']
];

const edgeList = [...MAIN_EDGES, ...BACKGROUND_EDGES];

async function fetchAll() {
  const db = {};
  for (const [from, to] of edgeList) {
    const p1 = NODE_POSITIONS[from];
    const p2 = NODE_POSITIONS[to];
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.routes && json.routes.length > 0) {
        db[`${from}_${to}`] = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        console.log(`Fetched ${from} -> ${to}`);
      } else {
        db[`${from}_${to}`] = [p1, p2];
        console.log(`Failed (No Routes) ${from} -> ${to}`);
      }
    } catch (e) {
      console.log(`Error ${from} -> ${to}:`, e.message);
      db[`${from}_${to}`] = [p1, p2];
    }
    // Wait 1.5 seconds between requests to guarantee we don't hit the 429 Rate Limit
    await new Promise(r => setTimeout(r, 1500));
  }
  
  fs.writeFileSync('c:/hackthon_prac/first_hackathon/frontend/src/utils/routeDB.json', JSON.stringify(db, null, 2));
  console.log("Database written to routeDB.json successfully!");
}

fetchAll();
