/** Canonical registry for assets that may be persisted in a DripSync room. */
export const ROOM_ASSETS = Object.freeze([
  { id:'skrt-sofa-01', name:'After Hours Sofa', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://interiors/sofa', category:'Seating', dimensions:[4.4,1.4,1.8], triangles:4200, textures:[], lods:[], collision:'box', interaction:'sit', renderer:'sofa', availability:'free', scalable:false },
  { id:'skrt-table-01', name:'Rail Coffee Table', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://interiors/table', category:'Tables', dimensions:[3.6,.9,1.4], triangles:1800, textures:[], lods:[], collision:'box', interaction:'inspect', renderer:'table', availability:'free', scalable:false },
  { id:'skrt-plant-01', name:'Concrete Palm', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://interiors/plant', category:'Plants', dimensions:[1,2.4,1], triangles:3600, textures:[], lods:[], collision:'cylinder', interaction:'inspect', renderer:'plant', availability:'free', scalable:false },
  { id:'skrt-lamp-01', name:'Five Lines Floor Lamp', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://room/lamp', category:'Lighting', dimensions:[.7,2.1,.7], triangles:2200, textures:[], lods:[], collision:'cylinder', interaction:'light', renderer:'floorLamp', availability:'free', scalable:false },
  { id:'five-lines-rack-01', name:'Five Lines Board Stand', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://room/board-stand', category:'Skate', dimensions:[2.4,1.5,.8], triangles:4800, textures:[], lods:[], collision:'box', interaction:'boardRack', renderer:'boardStand', availability:'free', scalable:false },
  { id:'skrt-art-01', name:'Frequency One', source:'skrtlife-original', license:'Skrtlife original — internal commercial use', author:'Skrtlife', sourceUrl:null, localPath:'procedural://interiors/art', category:'Art', dimensions:[3.2,3.8,.2], triangles:24, textures:[{kind:'generated-canvas',size:[768,1024]}], lods:[], collision:'none', interaction:'inspect', renderer:'art', availability:'free', scalable:false },
]);

export const ROOM_ASSET_IDS = Object.freeze(ROOM_ASSETS.map(asset=>asset.id));
export const getRoomAsset = id => ROOM_ASSETS.find(asset=>asset.id===id) || null;
export const isAllowedRoomAsset = id => ROOM_ASSET_IDS.includes(id);

