import StateBase from "../components/StateBase";
import Game from "../Game";
import Converter, * as Define from "../Define";
import MiscHelper from "../MiscHelper";
import UIMgr from "../UIMgr";
import GameMgr from "../GameMgr";
import NetworkManager from "../NetworkManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Waiting extends StateBase {

    @property({ type: cc.Enum(Define.GameState), serializable: true })
    public state: Define.GameState = Define.GameState.Waiting;

    onLoad() {
        let self = this;
        Game.Inst.EventListener.on("startGame",()=>{
            
            //goto rob bet
            self.m_FSM.setState(Define.GameState.GrabBanker);
        });

        Game.Inst.networkMgr.registerEvent("matching", (msg) => { this.receiveMatching(msg); });
        Game.Inst.networkMgr.registerEvent("init_info", (msg) => { this.receiveInitInfo(msg); });
        Game.Inst.networkMgr.registerEvent("game_start", (msg) => { this.receiveGameStart(msg); });

    }

    public stateInitialize() {
        cc.warn("initialize");
        ////init game
        Define.GameInfo.Inst.endGame = false;
        Define.GameInfo.Inst.rob_list = [];
        //init UI
        UIMgr.Inst.initUI();
    }

    /**
     * tell server client is ready to match
     */
    sendGameReady() {
        let data= {
            "event" : "ready"
        };
        Game.Inst.networkMgr.sendMessage(JSON.stringify(data));
        cc.warn("send Game ready");
    }

    public stateRelease() {
        //hide msg box
        Game.Inst.utils.hideAllMessageBox();
    }
    public stateUpdate(dt: number) {
    }

    /**
     * 收到"matching" respone
     * @param msg 
     */
    receiveMatching(msg: Define.MatchResp) {
        if (msg.success) {
            UIMgr.Inst.showWaiting();
        }
        else {
        //金額不足
            if (msg.code == 3002) {
                UIMgr.Inst.onMoneyNotEnoughToBet();
            }
        }
    }

    /**
     * 收到"init_info" respone
     * @param msg 
     */
    receiveInitInfo(msg: Define.InitGame) {
        cc.warn("receive init info ");

        if (this.isActive) {
            cc.log(msg);
            let gameInfo: Define.GameInfo = Define.GameInfo.Inst;

            //RoomInfo Setting
            gameInfo.baseBet = msg.game_info.base_bet;
            gameInfo.coinsLimit = msg.game_info.coins_limit;
            gameInfo.levyRate = msg.game_info.levy_rate;
            gameInfo.roomID = msg.game_info.room_id;

            //Player Setting
            gameInfo.playerCount = msg.players_info.length;
            gameInfo.players.length = 0;

            let myUID : string = gameInfo.myUID;
            cc.warn("myUID : " + myUID);

            //push myself first
            for (let i = 0; i < Define.GameInfo.Inst.playerCount; i++) {
                if(msg.players_info[i].pf_account != myUID) continue;
                let player: Define.Player = new Define.Player();
                player.UID = msg.players_info[i].pf_account;
                player.money = msg.players_info[i].money_src;
                player.name = msg.players_info[i].name;
                player.iconID = msg.players_info[i].avatar;
                player.gender = msg.players_info[i].gender;
                player.vip = msg.players_info[i].vip;
                gameInfo.players.push(player);
            }
            //skip mySelf
            for (let i = 0; i < Define.GameInfo.Inst.playerCount; i++) {
                if(msg.players_info[i].pf_account == myUID) continue;
                let player: Define.Player = new Define.Player();
                player.UID = msg.players_info[i].pf_account;
                player.money = msg.players_info[i].money_src;
                player.name = msg.players_info[i].name;
                player.iconID = msg.players_info[i].avatar;
                player.gender = msg.players_info[i].gender;
                player.vip = msg.players_info[i].vip;
                gameInfo.players.push(player);
            }

            UIMgr.Inst.initPlayerInfo();

            gameInfo.mainPlayer = Converter.getServerPlayerCount(myUID);

            //room info
            UIMgr.Inst.roomInfo.setRoomInfo(gameInfo.roomID);
            UIMgr.Inst.roomInfo.setRoomName(Converter.getServerRoomName(NetworkManager.Oid));
            UIMgr.Inst.roomInfo.setAntes(gameInfo.baseBet);
            UIMgr.Inst.roomInfo.setVisible(true);

            //send Ready request to server
            this.sendGameReady();
            //this.isReady = true;
        }
    }

    /**
     * 收到遊戲開始
     * @param msg 目前用不到
     */
    receiveGameStart(msg){
        Game.Inst.utils.hideAllMessageBox();
        UIMgr.Inst.animMgr.playStartGame();
    }
}
