import { Cafe } from '../lib/types';

export type MapStackParamList = {
  MapHome: undefined;
  CafeDetail: { cafe: Cafe };
  CheckInModal: { cafe: Cafe };
};
