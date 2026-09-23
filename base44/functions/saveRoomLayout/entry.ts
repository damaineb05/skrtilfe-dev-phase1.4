import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { ROOM_ASSET_IDS } from '../../shared/roomAssetRegistry.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const cleanVector=(value,fallback)=>Array.isArray(value)&&value.length===3&&value.every(Number.isFinite)?value.map(Number):fallback;

Deno.serve(contractHandler(async(req)=>{
  try{
    const base44=createClientFromRequest(req),user=await base44.auth.me();
    if(!user)return Response.json({error:'Unauthorized'},{status:401});
    const body=await req.json().catch(()=>null),layout=body?.layout;
    if(!layout||layout.roomId!=='dripsync-loft'||!Array.isArray(layout.objects))return Response.json({error:'Invalid room layout'},{status:400});
    if(layout.objects.length>60)return Response.json({error:'Room object limit exceeded'},{status:400});
    const ids=new Set(),objects=[];
    for(const raw of layout.objects){
      if(!raw||!ROOM_ASSET_IDS.includes(raw.assetId))return Response.json({error:'Room contains an unregistered asset'},{status:403});
      if(typeof raw.instanceId!=='string'||!raw.instanceId||ids.has(raw.instanceId))return Response.json({error:'Invalid room object identity'},{status:400});
      ids.add(raw.instanceId);
      const position=cleanVector(raw.position,[0,0,0]),rotation=cleanVector(raw.rotation,[0,0,0]);
      objects.push({instanceId:raw.instanceId.slice(0,100),assetId:raw.assetId,position:[clamp(position[0],-12.5,12.5),0,clamp(position[2],-18.5,18)],rotation:[0,clamp(rotation[1],-Math.PI*2,Math.PI*2),0],scale:[1,1,1],variant:typeof raw.variant==='string'?raw.variant.slice(0,40):'default',state:{active:Boolean(raw.state?.active)}});
    }
    const record={user_id:user.id,room_id:'dripsync-loft',schema_version:1,room_template:'dripsync-loft-v1',environment:'loft',lighting_preset:['night-studio','gallery','daylight'].includes(layout.lightingPreset)?layout.lightingPreset:'night-studio',objects};
    const current=await base44.asServiceRole.entities.RoomLayout.filter({user_id:user.id,room_id:'dripsync-loft'});
    const saved=current?.[0]?await base44.asServiceRole.entities.RoomLayout.update(current[0].id,record):await base44.asServiceRole.entities.RoomLayout.create(record);
    return Response.json({success:true,layout:{schemaVersion:1,roomId:record.room_id,userId:user.id,roomTemplate:record.room_template,environment:record.environment,lightingPreset:record.lighting_preset,objects:record.objects,updatedAt:saved.updated_date||new Date().toISOString()}});
  }catch(error){console.error('[saveRoomLayout] error:',error);return Response.json({error:error.message},{status:500});}
}));
