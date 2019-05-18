import Game from "./Game";
import { GameState } from "./MainStateMgr";

/**
 * 純邏輯通用功能物件
 */
export default class MiscHelper {

    /**
     * 取得場景名稱
     * @param mainstate 主場景狀態
     * @param gameid 遊戲場景ID(僅在轉換到GameState.Game時需要使用)
     */
    static getSceneName(mainstate: number) {
        switch (mainstate) {
            case GameState.Start: return "scene_start";
            case GameState.Loading: return "scene_loading";
            case GameState.Game: return "NiuNiu";
            default:
                cc.error("receiving wrong index of main state.");
                return "scene_start";
        }
    }

    /**
     * 產生隨機數字
     * @param min 最小值(有包含)
     * @param max 最大值(有包含)
     */
    static randomInt(min, max): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}