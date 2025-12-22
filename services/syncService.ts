
import { Candidate, Judge } from '../types';

/**
 * 这是一个简易的云同步服务
 * 为了演示多端互通，我们使用 npoint.io 提供的免费 JSON 存储
 * 在生产环境下，建议替换为 Firebase 或自建服务器
 */

const API_BASE = 'https://api.npoint.io';

export interface SyncData {
  candidates: Candidate[];
  judges: Judge[];
  version: number;
}

export const SyncService = {
  // 生成一个新的同步 Token (即 npoint 的 bin ID)
  async createSyncSession(initialData: SyncData): Promise<string> {
    const response = await fetch(`${API_BASE}/bins`, {
      method: 'POST',
      body: JSON.stringify(initialData),
    });
    const result = await response.json();
    return result.binId;
  },

  // 向云端推送数据
  async pushData(token: string, data: SyncData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/bins/${token}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (e) {
      console.error("Sync Push Error:", e);
      return false;
    }
  },

  // 从云端拉取数据
  async pullData(token: string): Promise<SyncData | null> {
    try {
      const response = await fetch(`${API_BASE}/bins/${token}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("Sync Pull Error:", e);
      return null;
    }
  },

  // 核心合并逻辑：Last-Writer-Wins
  mergeData(local: Candidate[], remote: Candidate[]): Candidate[] {
    const mergedMap = new Map<string, Candidate>();
    
    // 先放本地数据
    local.forEach(c => mergedMap.set(c.id, c));
    
    // 远程数据覆盖
    remote.forEach(remoteCand => {
      const localCand = mergedMap.get(remoteCand.id);
      if (!localCand) {
        mergedMap.set(remoteCand.id, remoteCand);
      } else {
        const localTime = new Date(localCand.lastUpdated).getTime();
        const remoteTime = new Date(remoteCand.lastUpdated).getTime();
        // 谁的时间戳新，谁就是最终版本
        if (remoteTime > localTime) {
          mergedMap.set(remoteCand.id, remoteCand);
        }
      }
    });

    return Array.from(mergedMap.values());
  }
};
