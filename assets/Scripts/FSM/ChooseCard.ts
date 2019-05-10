import StateBase from "../components/StateBase";
import * as Define from "../Define";
import Game from "../Game";
import UIMgr from "../UIMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChooseCard extends StateBase {

    @property({type:cc.Enum(Define.GameState),serializable:true})
    public state:Define.GameState = Define.GameState.ChooseCard;

    selfComplete: boolean = false;
    allOtherComplete: boolean = false;
    otherComplete: number = 0;

    onLoad(){
        
    }
    
    public stateInitialize(){
        cc.warn("choose card!!!");
        this.startCountDown();
        UIMgr.Inst.animMgr.playDistributePoker(()=>{
            UIMgr.Inst.showChooseCard(true);
            UIMgr.Inst.cardUIMgr.activate();
        });
        this.registerEvent();
    }

    public stateRelease(){
        cc.warn("change to calc");
        UIMgr.Inst.showChooseCard(false);
        Game.Inst.EventListener.clear();
        UIMgr.Inst.stopClock();
        UIMgr.Inst.cardUIMgr.unRegClickEvent();
        for(let index = 0;index< Define.GameInfo.Inst.playerCount;index++)
            UIMgr.Inst.CardStatusUIMgr.setComplete(index,false);
    }
    public stateUpdate(dt: number){
    }

    startCountDown() {
        //啟動clock
        UIMgr.Inst.setClockAct(15,()=>{
            this.m_FSM.setState(Define.GameState.Calc);
        });
    }

    registerEvent(){
        
        this.registerTimeSync();
        this.registerComplete();
    }

    playDistribute(callback?){
        UIMgr.Inst.animMgr.playDistributePoker(callback);
    }

    registerComplete(){
        Game.Inst.EventListener.on("cardChooseComplete",()=>{
            this.otherComplete++;
            cc.warn("complete num : " + this.otherComplete);
            if(this.otherComplete + 1 == Define.GameInfo.Inst.playerCount){
                cc.warn("all other complete" );
                this.allOtherComplete = true;
                //change stage when all complete
                if(this.selfComplete){
                    this.m_FSM.setState(Define.GameState.Calc);
                }
            }
        })
    }

    registerTimeSync(){
        Game.Inst.EventListener.on("getTime",function(event,data){
            if(data.stage == Define.GameState.ChooseCard){
                // cc.warn("update time : " + data.time);
                UIMgr.Inst.clock.countDown = data.time;
            }
        })
    }

    niuClick(event, customdata: number){
        let pressNiu: boolean = false;
        if(customdata == 1) pressNiu = true;
        if(UIMgr.Inst.cardUIMgr.niuClickCorrect(pressNiu)){
            UIMgr.Inst.showChooseCard(false);
            UIMgr.Inst.cardUIMgr.unRegClickEvent();
            Game.Inst.networkMgr.chooseCardComplete();
            this.selfComplete = true;
            //choose complete anime
            cc.warn("niuClick");
            UIMgr.Inst.animMgr.playChooseCompleteAnim();
            //show card type
            UIMgr.Inst.CardStatusUIMgr.setType(0,Define.GameInfo.Inst.players[0].cardType);

            //change stage when all complete
            if(this.allOtherComplete){
                this.m_FSM.setState(Define.GameState.Calc);
            }
        }
        else
            UIMgr.Inst.animMgr.playCardTypeError();
    }

}
