import { Cafe } from '../lib/types';

export type MapStackParamList = {
  MapHome: undefined;
  CafeDetail: { cafe: Cafe };
  CheckInModal: { cafe: Cafe };
};

export type FeedStackParamList = {
  FeedHome: undefined;
  UserProfile: { userId: string };
};
