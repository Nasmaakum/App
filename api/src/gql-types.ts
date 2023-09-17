import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Call as CallModel, User as UserModel, UserPreferences as UserPreferencesModel, Interpreter as InterpreterModel, InterpreterRating as InterpreterRatingModel, InterpreterRatingOption as InterpreterRatingOptionModel, Notification as NotificationModel, Advertisement as AdvertisementModel, TermsOfUse as TermsOfUseModel, TermsOfUseAcceptance as TermsOfUseAcceptanceModel, PrivacyPolicy as PrivacyPolicyModel, PrivacyPolicyAcceptance as PrivacyPolicyAcceptanceModel, ExpoToken as ExpoTokenModel, Service as ServiceModel, ServiceCategory as ServiceCategoryModel, FrequentlyAskedQuestion as FrequentlyAskedQuestionModel, About as AboutModel, OneTimePassword as OneTimePasswordModel, Config as ConfigModel } from '@prisma/client';
import { Context } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
  EmailAddress: string;
  LowercaseString: string;
  Null: any;
  NullableID: null | string;
  NullableNumber: null | number;
  NullableString: null | string;
  OTP: string;
  Password: string;
  PhoneNumber: string;
  UntrimmedString: string;
  Upload: any;
  UppercaseString: string;
};

export type About = {
  __typename?: 'About';
  content?: Maybe<Scalars['String']>;
  contentAr?: Maybe<Scalars['String']>;
  contentEn: Scalars['String'];
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  updatedAt: Scalars['Date'];
  version: Scalars['Int'];
};

export type AboutCreateInput = {
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn: Scalars['String'];
};

export type AboutOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type AboutUpdateInput = {
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn?: InputMaybe<Scalars['String']>;
};

export type AboutWhereInput = {
  AND?: InputMaybe<Array<AboutWhereInput>>;
  NOT?: InputMaybe<Array<AboutWhereInput>>;
  OR?: InputMaybe<Array<AboutWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type AboutWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type Advertisement = {
  __typename?: 'Advertisement';
  active: Scalars['Boolean'];
  content: Scalars['String'];
  contentAr?: Maybe<Scalars['String']>;
  contentEn: Scalars['String'];
  createdAt: Scalars['Date'];
  duration: Scalars['Int'];
  id: Scalars['ID'];
  image: Scalars['String'];
  title: Scalars['String'];
  titleAr?: Maybe<Scalars['String']>;
  titleEn: Scalars['String'];
  updatedAt: Scalars['Date'];
  url?: Maybe<Scalars['String']>;
  views: Scalars['Int'];
};

export type AdvertisementCreateInput = {
  active: Scalars['Boolean'];
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn: Scalars['String'];
  duration: Scalars['Int'];
  image: Scalars['Upload'];
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn: Scalars['String'];
  url: Scalars['String'];
};

export type AdvertisementOrderByInput = {
  active?: InputMaybe<OrderDirection>;
  createdAt?: InputMaybe<OrderDirection>;
  duration?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
  views?: InputMaybe<OrderDirection>;
};

export type AdvertisementUpdateInput = {
  active?: InputMaybe<Scalars['Boolean']>;
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn?: InputMaybe<Scalars['String']>;
  duration?: InputMaybe<Scalars['Int']>;
  image?: InputMaybe<Scalars['Upload']>;
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type AdvertisementWhereInput = {
  AND?: InputMaybe<Array<AdvertisementWhereInput>>;
  NOT?: InputMaybe<Array<AdvertisementWhereInput>>;
  OR?: InputMaybe<Array<AdvertisementWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type AdvertisementWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type ArrayNullableFilter = {
  equals?: InputMaybe<Array<Scalars['String']>>;
  has?: InputMaybe<Scalars['String']>;
  hasEvery?: InputMaybe<Array<Scalars['String']>>;
  hasSome?: InputMaybe<Array<Scalars['String']>>;
  isEmpty?: InputMaybe<Scalars['Boolean']>;
};

export type Authentication = {
  __typename?: 'Authentication';
  token: Scalars['String'];
  user: User;
};

export type AuthenticationResponse = {
  __typename?: 'AuthenticationResponse';
  authentication?: Maybe<Authentication>;
  message?: Maybe<Scalars['String']>;
};

export type BatchPayload = {
  __typename?: 'BatchPayload';
  count: Scalars['Int'];
};

export type Call = {
  __typename?: 'Call';
  createdAt: Scalars['Date'];
  endedAt?: Maybe<Scalars['Date']>;
  from: User;
  id: Scalars['ID'];
  service?: Maybe<Service>;
  serviceCalledAt?: Maybe<Scalars['Date']>;
  serviceEndedAt?: Maybe<Scalars['Date']>;
  startedAt?: Maybe<Scalars['Date']>;
  status: CallStatus;
  to: Interpreter;
  token?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Date'];
};

export type CallOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type CallStatus =
  | 'ANSWERED'
  | 'CALLING'
  | 'ENDED'
  | 'FAILED'
  | 'REJECTED';

export type CallWhereInput = {
  AND?: InputMaybe<Array<CallWhereInput>>;
  NOT?: InputMaybe<Array<CallWhereInput>>;
  OR?: InputMaybe<Array<CallWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type CallWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String'];
  newPassword: Scalars['Password'];
};

export type CheckEmailInput = {
  email: Scalars['EmailAddress'];
};

export type CompareVersionsInput = {
  version: Scalars['String'];
};

export type ConnectServiceInput = {
  id: Scalars['ID'];
};

export type EndCallInput = {
  id: Scalars['ID'];
};

export type FloatNullableFilter = {
  equals?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<Scalars['Float']>>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  not?: InputMaybe<NestedFloatNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Float']>>;
};

export type FrequentlyAskedQuestion = {
  __typename?: 'FrequentlyAskedQuestion';
  answer: Scalars['String'];
  answerAr?: Maybe<Scalars['String']>;
  answerEn: Scalars['String'];
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  question: Scalars['String'];
  questionAr?: Maybe<Scalars['String']>;
  questionEn: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type FrequentlyAskedQuestionCreateInput = {
  answerAr?: InputMaybe<Scalars['String']>;
  answerEn: Scalars['String'];
  questionAr?: InputMaybe<Scalars['String']>;
  questionEn: Scalars['String'];
};

export type FrequentlyAskedQuestionOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type FrequentlyAskedQuestionUpdateInput = {
  answerAr?: InputMaybe<Scalars['String']>;
  answerEn?: InputMaybe<Scalars['String']>;
  questionAr?: InputMaybe<Scalars['String']>;
  questionEn?: InputMaybe<Scalars['String']>;
};

export type FrequentlyAskedQuestionWhereInput = {
  AND?: InputMaybe<Array<FrequentlyAskedQuestionWhereInput>>;
  NOT?: InputMaybe<Array<FrequentlyAskedQuestionWhereInput>>;
  OR?: InputMaybe<Array<FrequentlyAskedQuestionWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type FrequentlyAskedQuestionWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type Gender =
  | 'FEMALE'
  | 'MALE';

export type IdFilter = {
  equals?: InputMaybe<Scalars['ID']>;
  gt?: InputMaybe<Scalars['ID']>;
  gte?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  lt?: InputMaybe<Scalars['ID']>;
  lte?: InputMaybe<Scalars['ID']>;
  not?: InputMaybe<IdFilter>;
  notIn?: InputMaybe<Array<Scalars['ID']>>;
};

export type IntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type Interpreter = {
  __typename?: 'Interpreter';
  approved: Scalars['Boolean'];
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  isBusy: Scalars['Boolean'];
  isFavorite: Scalars['Boolean'];
  languages: Array<Scalars['String']>;
  online: Scalars['Boolean'];
  rating: Scalars['Float'];
  ratings: Array<InterpreterRating>;
  status: InterpreterStatus;
  updatedAt: Scalars['Date'];
  user: InterpreterUser;
};

export type InterpreterOrderByInput = {
  approved?: InputMaybe<OrderDirection>;
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
  online?: InputMaybe<OrderDirection>;
};

export type InterpreterRating = {
  __typename?: 'InterpreterRating';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  interpreter: Interpreter;
  ip?: Maybe<Scalars['String']>;
  options: Array<InterpreterRatingOption>;
  rating: Scalars['Int'];
  tellUsMore?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Date'];
  user?: Maybe<User>;
};

export type InterpreterRatingCreateInput = {
  interpreter: Scalars['ID'];
  options: Array<Scalars['ID']>;
  rating: Scalars['Int'];
  tellUsMore?: InputMaybe<Scalars['String']>;
};

export type InterpreterRatingOption = {
  __typename?: 'InterpreterRatingOption';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  ratingVisibleFrom?: Maybe<Scalars['Float']>;
  ratingVisibleTo?: Maybe<Scalars['Float']>;
  ratings: Array<InterpreterRating>;
  title: Scalars['String'];
  titleAr?: Maybe<Scalars['String']>;
  titleEn: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type InterpreterRatingOptionCreateInput = {
  ratingVisibleFrom: Scalars['Float'];
  ratingVisibleTo: Scalars['Float'];
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn: Scalars['String'];
};

export type InterpreterRatingOptionOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type InterpreterRatingOptionUpdateInput = {
  ratingVisibleFrom?: InputMaybe<Scalars['Float']>;
  ratingVisibleTo?: InputMaybe<Scalars['Float']>;
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn?: InputMaybe<Scalars['String']>;
};

export type InterpreterRatingOptionWhereInput = {
  AND?: InputMaybe<Array<InterpreterRatingOptionWhereInput>>;
  NOT?: InputMaybe<Array<InterpreterRatingOptionWhereInput>>;
  OR?: InputMaybe<Array<InterpreterRatingOptionWhereInput>>;
  id?: InputMaybe<IdFilter>;
  ratingVisibleFrom?: InputMaybe<FloatNullableFilter>;
  ratingVisibleTo?: InputMaybe<FloatNullableFilter>;
};

export type InterpreterRatingOptionWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type InterpreterRatingOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type InterpreterRatingUpdateInput = {
  interpreter?: InputMaybe<Scalars['ID']>;
  options?: InputMaybe<Array<Scalars['ID']>>;
  rating?: InputMaybe<Scalars['Int']>;
  tellUsMore?: InputMaybe<Scalars['String']>;
};

export type InterpreterRatingWhereInput = {
  AND?: InputMaybe<Array<InterpreterRatingWhereInput>>;
  NOT?: InputMaybe<Array<InterpreterRatingWhereInput>>;
  OR?: InputMaybe<Array<InterpreterRatingWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type InterpreterRatingWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type InterpreterStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

export type InterpreterUpdateInput = {
  languages?: InputMaybe<Array<Scalars['String']>>;
  status?: InputMaybe<InterpreterStatus>;
};

export type InterpreterUser = {
  __typename?: 'InterpreterUser';
  firstName: Scalars['String'];
  fullName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  lastName: Scalars['String'];
};

export type InterpreterWhereInput = {
  AND?: InputMaybe<Array<InterpreterWhereInput>>;
  NOT?: InputMaybe<Array<InterpreterWhereInput>>;
  OR?: InputMaybe<Array<InterpreterWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type InterpreterWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type KeepCallAliveData = {
  getToken?: InputMaybe<Scalars['Boolean']>;
};

export type KeepCallAliveWhereInput = {
  id: Scalars['ID'];
};

export type LoginInput = {
  email: Scalars['EmailAddress'];
  password: Scalars['String'];
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']>;
  acceptPrivacyPolicy: PrivacyPolicyAcceptance;
  acceptTermsOfUse: TermsOfUseAcceptance;
  activateAdvertisement: Advertisement;
  activeCall?: Maybe<Call>;
  answerCall: Call;
  approveInterpreter: Interpreter;
  changePassword: MessageResponse;
  connectService: Call;
  createAbout: About;
  createAdvertisement: Advertisement;
  createFrequentlyAskedQuestion: FrequentlyAskedQuestion;
  createInterpreterRating: InterpreterRating;
  createInterpreterRatingOption: InterpreterRatingOption;
  createNotification: Notification;
  createPrivacyPolicy: PrivacyPolicy;
  createService: Service;
  createServiceCategory: ServiceCategory;
  createTermsOfUse: TermsOfUse;
  createUser: User;
  deleteAbout: About;
  deleteAdvertisement: Advertisement;
  deleteFrequentlyAskedQuestion: FrequentlyAskedQuestion;
  deleteInterpreterRating: InterpreterRating;
  deleteInterpreterRatingOption: InterpreterRatingOption;
  deleteMyUser: User;
  deleteNotification: Notification;
  deletePrivacyPolicy: PrivacyPolicy;
  deleteService: Service;
  deleteServiceCategory: ServiceCategory;
  deleteTermsOfUse: TermsOfUse;
  deleteUser: User;
  disconnectService: Call;
  endCall: Call;
  keepCallAlive: Call;
  register: MessageResponse;
  rejectCall: Call;
  rejectInterpreter: Interpreter;
  requestPasswordReset: MessageResponse;
  resetPassword: AuthenticationResponse;
  sendNotification: MessageResponse;
  startCall: Call;
  submitExpoToken: MessageResponse;
  toggleFavoriteInterpreter: Scalars['Boolean'];
  toggleInterpreterAvailability: Scalars['Boolean'];
  toggleMaintenanceMode: MessageResponse;
  updateAbout: About;
  updateAdvertisement: Advertisement;
  updateFrequentlyAskedQuestion: FrequentlyAskedQuestion;
  updateInterpreter: Interpreter;
  updateInterpreterRating: InterpreterRating;
  updateInterpreterRatingOption: InterpreterRatingOption;
  updateMyInterpreter: Interpreter;
  updateMyPreferences: UserPreferences;
  updateMyUser: User;
  updateNotification: Notification;
  updatePrivacyPolicy: PrivacyPolicy;
  updateService: Service;
  updateServiceCategory: ServiceCategory;
  updateTermsOfUse: TermsOfUse;
  updateUser: User;
  verifyPasswordReset: MessageResponse;
  verifyRegistration: AuthenticationResponse;
};


export type MutationAcceptPrivacyPolicyArgs = {
  where: PrivacyPolicyWhereUniqueInput;
};


export type MutationAcceptTermsOfUseArgs = {
  where: TermsOfUseWhereUniqueInput;
};


export type MutationActivateAdvertisementArgs = {
  where: AdvertisementWhereUniqueInput;
};


export type MutationApproveInterpreterArgs = {
  where: InterpreterWhereUniqueInput;
};


export type MutationChangePasswordArgs = {
  data: ChangePasswordInput;
};


export type MutationConnectServiceArgs = {
  data: ConnectServiceInput;
};


export type MutationCreateAboutArgs = {
  data: AboutCreateInput;
};


export type MutationCreateAdvertisementArgs = {
  data: AdvertisementCreateInput;
};


export type MutationCreateFrequentlyAskedQuestionArgs = {
  data: FrequentlyAskedQuestionCreateInput;
};


export type MutationCreateInterpreterRatingArgs = {
  data: InterpreterRatingCreateInput;
};


export type MutationCreateInterpreterRatingOptionArgs = {
  data: InterpreterRatingOptionCreateInput;
};


export type MutationCreateNotificationArgs = {
  data: NotificationCreateInput;
};


export type MutationCreatePrivacyPolicyArgs = {
  data: PrivacyPolicyCreateInput;
};


export type MutationCreateServiceArgs = {
  data: ServiceCreateInput;
};


export type MutationCreateServiceCategoryArgs = {
  data: ServiceCategoryCreateInput;
};


export type MutationCreateTermsOfUseArgs = {
  data: TermsOfUseCreateInput;
};


export type MutationCreateUserArgs = {
  data: UserCreateInput;
};


export type MutationDeleteAboutArgs = {
  where: AboutWhereUniqueInput;
};


export type MutationDeleteAdvertisementArgs = {
  where: AdvertisementWhereUniqueInput;
};


export type MutationDeleteFrequentlyAskedQuestionArgs = {
  where: FrequentlyAskedQuestionWhereUniqueInput;
};


export type MutationDeleteInterpreterRatingArgs = {
  where: InterpreterRatingWhereUniqueInput;
};


export type MutationDeleteInterpreterRatingOptionArgs = {
  where: InterpreterRatingOptionWhereUniqueInput;
};


export type MutationDeleteMyUserArgs = {
  data: MyUserDeleteInput;
};


export type MutationDeleteNotificationArgs = {
  where: NotificationWhereUniqueInput;
};


export type MutationDeletePrivacyPolicyArgs = {
  where: PrivacyPolicyWhereUniqueInput;
};


export type MutationDeleteServiceArgs = {
  where: ServiceWhereUniqueInput;
};


export type MutationDeleteServiceCategoryArgs = {
  where: ServiceCategoryWhereUniqueInput;
};


export type MutationDeleteTermsOfUseArgs = {
  where: TermsOfUseWhereUniqueInput;
};


export type MutationDeleteUserArgs = {
  where: UserWhereUniqueInput;
};


export type MutationKeepCallAliveArgs = {
  data: KeepCallAliveData;
  where: KeepCallAliveWhereInput;
};


export type MutationRegisterArgs = {
  data: RegistrationInput;
};


export type MutationRejectInterpreterArgs = {
  where: InterpreterWhereUniqueInput;
};


export type MutationRequestPasswordResetArgs = {
  data: RequestPasswordResetInput;
};


export type MutationResetPasswordArgs = {
  data: ResetPasswordInput;
};


export type MutationSendNotificationArgs = {
  data: SendNotificationInput;
};


export type MutationStartCallArgs = {
  where: StartCallWhereInput;
};


export type MutationSubmitExpoTokenArgs = {
  data: SubmitExpoTokenInput;
};


export type MutationToggleFavoriteInterpreterArgs = {
  where: InterpreterWhereUniqueInput;
};


export type MutationUpdateAboutArgs = {
  data: AboutUpdateInput;
  where: AboutWhereUniqueInput;
};


export type MutationUpdateAdvertisementArgs = {
  data: AdvertisementUpdateInput;
  where: AdvertisementWhereUniqueInput;
};


export type MutationUpdateFrequentlyAskedQuestionArgs = {
  data: FrequentlyAskedQuestionUpdateInput;
  where: FrequentlyAskedQuestionWhereUniqueInput;
};


export type MutationUpdateInterpreterArgs = {
  data: InterpreterUpdateInput;
  where: InterpreterWhereUniqueInput;
};


export type MutationUpdateInterpreterRatingArgs = {
  data: InterpreterRatingUpdateInput;
  where: InterpreterRatingWhereUniqueInput;
};


export type MutationUpdateInterpreterRatingOptionArgs = {
  data: InterpreterRatingOptionUpdateInput;
  where: InterpreterRatingOptionWhereUniqueInput;
};


export type MutationUpdateMyInterpreterArgs = {
  data: MyInterpreterUpdateInput;
};


export type MutationUpdateMyPreferencesArgs = {
  data: MyUserPreferencesUpdateInput;
};


export type MutationUpdateMyUserArgs = {
  data: MyUserUpdateInput;
};


export type MutationUpdateNotificationArgs = {
  data: NotificationUpdateInput;
  where: NotificationWhereUniqueInput;
};


export type MutationUpdatePrivacyPolicyArgs = {
  data: PrivacyPolicyUpdateInput;
  where: PrivacyPolicyWhereUniqueInput;
};


export type MutationUpdateServiceArgs = {
  data: ServiceUpdateInput;
  where: ServiceWhereUniqueInput;
};


export type MutationUpdateServiceCategoryArgs = {
  data: ServiceCategoryUpdateInput;
  where: ServiceCategoryWhereUniqueInput;
};


export type MutationUpdateTermsOfUseArgs = {
  data: TermsOfUseUpdateInput;
  where: TermsOfUseWhereUniqueInput;
};


export type MutationUpdateUserArgs = {
  data: UserUpdateInput;
  where: UserWhereUniqueInput;
};


export type MutationVerifyPasswordResetArgs = {
  data: VerifyPasswordResetInput;
};


export type MutationVerifyRegistrationArgs = {
  data: VerifyRegistrationInput;
};

export type MyInterpreterUpdateInput = {
  languages?: InputMaybe<Array<Scalars['String']>>;
};

export type MyUserDeleteInput = {
  password: Scalars['String'];
};

export type MyUserPreferencesUpdateInput = {
  emailNotifications?: InputMaybe<Scalars['Boolean']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']>;
  smsNotifications?: InputMaybe<Scalars['Boolean']>;
};

export type MyUserUpdateInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  cpr?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['Date']>;
  email?: InputMaybe<Scalars['EmailAddress']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Gender>;
  image?: InputMaybe<Scalars['Upload']>;
  language?: InputMaybe<Scalars['UppercaseString']>;
  lastName?: InputMaybe<Scalars['String']>;
  mobile?: InputMaybe<Scalars['PhoneNumber']>;
};

export type NestedFloatNullableFilter = {
  equals?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<Scalars['Float']>>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  not?: InputMaybe<NestedFloatNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Float']>>;
};

export type NestedIntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type NestedStringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  message: Scalars['String'];
  messageAr?: Maybe<Scalars['String']>;
  messageEn: Scalars['String'];
  title: Scalars['String'];
  titleAr?: Maybe<Scalars['String']>;
  titleEn: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type NotificationCreateInput = {
  messageAr?: InputMaybe<Scalars['String']>;
  messageEn: Scalars['String'];
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn: Scalars['String'];
};

export type NotificationOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type NotificationUpdateInput = {
  messageAr?: InputMaybe<Scalars['String']>;
  messageEn?: InputMaybe<Scalars['String']>;
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn?: InputMaybe<Scalars['String']>;
};

export type NotificationWhereInput = {
  AND?: InputMaybe<Array<NotificationWhereInput>>;
  NOT?: InputMaybe<Array<NotificationWhereInput>>;
  OR?: InputMaybe<Array<NotificationWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type NotificationWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type OrderDirection =
  | 'asc'
  | 'desc';

export type PrivacyPolicy = {
  __typename?: 'PrivacyPolicy';
  content: Scalars['String'];
  contentAr?: Maybe<Scalars['String']>;
  contentEn: Scalars['String'];
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  updatedAt: Scalars['Date'];
  version: Scalars['Int'];
};

export type PrivacyPolicyAcceptance = {
  __typename?: 'PrivacyPolicyAcceptance';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  privacyPolicy: PrivacyPolicy;
  updatedAt: Scalars['Date'];
  user: User;
};

export type PrivacyPolicyCreateInput = {
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn: Scalars['String'];
};

export type PrivacyPolicyOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type PrivacyPolicyUpdateInput = {
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn?: InputMaybe<Scalars['String']>;
};

export type PrivacyPolicyWhereInput = {
  AND?: InputMaybe<Array<PrivacyPolicyWhereInput>>;
  NOT?: InputMaybe<Array<PrivacyPolicyWhereInput>>;
  OR?: InputMaybe<Array<PrivacyPolicyWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type PrivacyPolicyWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  about: About;
  abouts: Array<About>;
  aboutsCount: Scalars['Int'];
  activeAdvertisements: Array<Advertisement>;
  advertisement?: Maybe<Advertisement>;
  advertisements: Array<Advertisement>;
  advertisementsCount: Scalars['Int'];
  call: Call;
  calls: Array<Call>;
  callsCount: Scalars['Int'];
  compareVersions: MessageResponse;
  frequentlyAskedQuestion: FrequentlyAskedQuestion;
  frequentlyAskedQuestions: Array<FrequentlyAskedQuestion>;
  frequentlyAskedQuestionsCount: Scalars['Int'];
  interpreter: Interpreter;
  interpreterRating: InterpreterRating;
  interpreterRatingOption: InterpreterRatingOption;
  interpreterRatingOptions: Array<InterpreterRatingOption>;
  interpreterRatingOptionsCount: Scalars['Int'];
  interpreterRatings: Array<InterpreterRating>;
  interpreterRatingsCount: Scalars['Int'];
  interpreters: Array<Interpreter>;
  interpretersCount: Scalars['Int'];
  latestAbout: About;
  latestPrivacyPolicy: PrivacyPolicy;
  latestTermsOfUse: TermsOfUse;
  login: AuthenticationResponse;
  maintenanceMode: MessageResponse;
  myAvailability: Scalars['Boolean'];
  myNotifications: Array<Notification>;
  myNotificationsCount: Scalars['Int'];
  myPreferences: UserPreferences;
  myUser: User;
  notification: Notification;
  notifications: Array<Notification>;
  notificationsCount: Scalars['Int'];
  outboundNumber: Scalars['String'];
  privacyPolicies: Array<PrivacyPolicy>;
  privacyPoliciesCount: Scalars['Int'];
  privacyPolicy: PrivacyPolicy;
  service: Service;
  serviceCategories: Array<ServiceCategory>;
  serviceCategoriesCount: Scalars['Int'];
  serviceCategory: ServiceCategory;
  services: Array<Service>;
  servicesCount: Scalars['Int'];
  termsOfUse: TermsOfUse;
  termsOfUses: Array<TermsOfUse>;
  termsOfUsesCount: Scalars['Int'];
  user: User;
  users: Array<User>;
  usersCount: Scalars['Int'];
};


export type QueryAboutArgs = {
  where: AboutWhereUniqueInput;
};


export type QueryAboutsArgs = {
  orderBy?: InputMaybe<Array<AboutOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AboutWhereInput>;
};


export type QueryAboutsCountArgs = {
  where?: InputMaybe<AboutWhereInput>;
};


export type QueryAdvertisementArgs = {
  where: AdvertisementWhereUniqueInput;
};


export type QueryAdvertisementsArgs = {
  orderBy?: InputMaybe<Array<AdvertisementOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AdvertisementWhereInput>;
};


export type QueryAdvertisementsCountArgs = {
  where?: InputMaybe<AdvertisementWhereInput>;
};


export type QueryCallArgs = {
  where: CallWhereUniqueInput;
};


export type QueryCallsArgs = {
  orderBy?: InputMaybe<Array<CallOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CallWhereInput>;
};


export type QueryCallsCountArgs = {
  where?: InputMaybe<CallWhereInput>;
};


export type QueryCompareVersionsArgs = {
  data: CompareVersionsInput;
};


export type QueryFrequentlyAskedQuestionArgs = {
  where: FrequentlyAskedQuestionWhereUniqueInput;
};


export type QueryFrequentlyAskedQuestionsArgs = {
  orderBy?: InputMaybe<Array<FrequentlyAskedQuestionOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<FrequentlyAskedQuestionWhereInput>;
};


export type QueryFrequentlyAskedQuestionsCountArgs = {
  where?: InputMaybe<FrequentlyAskedQuestionWhereInput>;
};


export type QueryInterpreterArgs = {
  where: InterpreterWhereUniqueInput;
};


export type QueryInterpreterRatingArgs = {
  where: InterpreterRatingWhereUniqueInput;
};


export type QueryInterpreterRatingOptionArgs = {
  where: InterpreterRatingOptionWhereUniqueInput;
};


export type QueryInterpreterRatingOptionsArgs = {
  orderBy?: InputMaybe<Array<InterpreterRatingOptionOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InterpreterRatingOptionWhereInput>;
};


export type QueryInterpreterRatingOptionsCountArgs = {
  where?: InputMaybe<InterpreterRatingOptionWhereInput>;
};


export type QueryInterpreterRatingsArgs = {
  orderBy?: InputMaybe<Array<InterpreterRatingOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InterpreterRatingWhereInput>;
};


export type QueryInterpreterRatingsCountArgs = {
  where?: InputMaybe<InterpreterRatingWhereInput>;
};


export type QueryInterpretersArgs = {
  orderBy?: InputMaybe<Array<InterpreterOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InterpreterWhereInput>;
};


export type QueryInterpretersCountArgs = {
  where?: InputMaybe<InterpreterWhereInput>;
};


export type QueryLoginArgs = {
  data: LoginInput;
};


export type QueryMyNotificationsArgs = {
  orderBy?: InputMaybe<Array<NotificationOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NotificationWhereInput>;
};


export type QueryMyNotificationsCountArgs = {
  where?: InputMaybe<NotificationWhereInput>;
};


export type QueryNotificationArgs = {
  where: NotificationWhereUniqueInput;
};


export type QueryNotificationsArgs = {
  orderBy?: InputMaybe<Array<NotificationOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NotificationWhereInput>;
};


export type QueryNotificationsCountArgs = {
  where?: InputMaybe<NotificationWhereInput>;
};


export type QueryPrivacyPoliciesArgs = {
  orderBy?: InputMaybe<Array<PrivacyPolicyOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PrivacyPolicyWhereInput>;
};


export type QueryPrivacyPoliciesCountArgs = {
  where?: InputMaybe<PrivacyPolicyWhereInput>;
};


export type QueryPrivacyPolicyArgs = {
  where: PrivacyPolicyWhereUniqueInput;
};


export type QueryServiceArgs = {
  where: ServiceWhereUniqueInput;
};


export type QueryServiceCategoriesArgs = {
  orderBy?: InputMaybe<Array<ServiceCategoryOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ServiceCategoryWhereInput>;
};


export type QueryServiceCategoriesCountArgs = {
  where?: InputMaybe<ServiceCategoryWhereInput>;
};


export type QueryServiceCategoryArgs = {
  where: ServiceCategoryWhereUniqueInput;
};


export type QueryServicesArgs = {
  orderBy?: InputMaybe<Array<ServiceOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ServiceWhereInput>;
};


export type QueryServicesCountArgs = {
  where?: InputMaybe<ServiceWhereInput>;
};


export type QueryTermsOfUseArgs = {
  where: TermsOfUseWhereUniqueInput;
};


export type QueryTermsOfUsesArgs = {
  orderBy?: InputMaybe<Array<TermsOfUseOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TermsOfUseWhereInput>;
};


export type QueryTermsOfUsesCountArgs = {
  where?: InputMaybe<TermsOfUseWhereInput>;
};


export type QueryUserArgs = {
  where: UserWhereUniqueInput;
};


export type QueryUsersArgs = {
  orderBy?: InputMaybe<Array<UserOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UserWhereInput>;
};


export type QueryUsersCountArgs = {
  where?: InputMaybe<UserWhereInput>;
};

export type QueryMode =
  | 'default'
  | 'insensitive';

export type RegistrationInput = {
  acceptPrivacyPolicy: Scalars['Boolean'];
  acceptTermsOfUse: Scalars['Boolean'];
  city: Scalars['String'];
  country: Scalars['String'];
  cpr: Scalars['String'];
  dateOfBirth: Scalars['Date'];
  email: Scalars['EmailAddress'];
  firstName: Scalars['String'];
  gender: Gender;
  interpreter?: InputMaybe<RegistrationInterpreterInput>;
  language: Scalars['String'];
  lastName: Scalars['String'];
  mobile: Scalars['PhoneNumber'];
  password: Scalars['Password'];
};

export type RegistrationInterpreterInput = {
  languages: Array<Scalars['String']>;
};

export type RelationshipNullableFilter = {
  id?: InputMaybe<Scalars['ID']>;
  is?: InputMaybe<Scalars['Null']>;
  isNot?: InputMaybe<Scalars['Null']>;
};

export type RequestPasswordResetInput = {
  email: Scalars['EmailAddress'];
};

export type ResetPasswordInput = {
  code: Scalars['OTP'];
  email: Scalars['EmailAddress'];
  password: Scalars['Password'];
};

export type SendNotificationInput = {
  body: Scalars['String'];
  test?: InputMaybe<Scalars['Boolean']>;
  title: Scalars['String'];
};

export type Service = {
  __typename?: 'Service';
  category?: Maybe<ServiceCategory>;
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  descriptionAr?: Maybe<Scalars['String']>;
  descriptionEn: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  name: Scalars['String'];
  nameAr?: Maybe<Scalars['String']>;
  nameEn: Scalars['String'];
  phone: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type ServiceCategory = {
  __typename?: 'ServiceCategory';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  image: Scalars['String'];
  services?: Maybe<Array<Service>>;
  title: Scalars['String'];
  titleAr?: Maybe<Scalars['String']>;
  titleEn: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type ServiceCategoryCreateInput = {
  image: Scalars['Upload'];
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn: Scalars['String'];
};

export type ServiceCategoryOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
  titleEn?: InputMaybe<OrderDirection>;
};

export type ServiceCategoryUpdateInput = {
  image?: InputMaybe<Scalars['Upload']>;
  titleAr?: InputMaybe<Scalars['String']>;
  titleEn?: InputMaybe<Scalars['String']>;
};

export type ServiceCategoryWhereInput = {
  AND?: InputMaybe<Array<ServiceCategoryWhereInput>>;
  NOT?: InputMaybe<Array<ServiceCategoryWhereInput>>;
  OR?: InputMaybe<Array<ServiceCategoryWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type ServiceCategoryWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type ServiceCreateInput = {
  categoryId: Scalars['ID'];
  descriptionAr?: InputMaybe<Scalars['String']>;
  descriptionEn: Scalars['String'];
  image: Scalars['Upload'];
  nameAr?: InputMaybe<Scalars['String']>;
  nameEn: Scalars['String'];
  phone: Scalars['PhoneNumber'];
};

export type ServiceOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type ServiceUpdateInput = {
  categoryId?: InputMaybe<Scalars['ID']>;
  descriptionAr?: InputMaybe<Scalars['String']>;
  descriptionEn?: InputMaybe<Scalars['String']>;
  image?: InputMaybe<Scalars['Upload']>;
  nameAr?: InputMaybe<Scalars['String']>;
  nameEn?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['PhoneNumber']>;
};

export type ServiceWhereInput = {
  AND?: InputMaybe<Array<ServiceWhereInput>>;
  NOT?: InputMaybe<Array<ServiceWhereInput>>;
  OR?: InputMaybe<Array<ServiceWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type ServiceWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type StartCallWhereInput = {
  id: Scalars['ID'];
};

export type StringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type SubmitExpoTokenInput = {
  token: Scalars['String'];
};

export type TermsOfUse = {
  __typename?: 'TermsOfUse';
  content: Scalars['String'];
  contentAr?: Maybe<Scalars['String']>;
  contentEn: Scalars['String'];
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  updatedAt: Scalars['Date'];
  version: Scalars['Int'];
};

export type TermsOfUseAcceptance = {
  __typename?: 'TermsOfUseAcceptance';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  termsOfUse: TermsOfUse;
  updatedAt: Scalars['Date'];
  user: User;
};

export type TermsOfUseCreateInput = {
  contentAr: Scalars['String'];
  contentEn: Scalars['String'];
};

export type TermsOfUseOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
};

export type TermsOfUseUpdateInput = {
  contentAr?: InputMaybe<Scalars['String']>;
  contentEn?: InputMaybe<Scalars['String']>;
};

export type TermsOfUseWhereInput = {
  AND?: InputMaybe<Array<TermsOfUseWhereInput>>;
  NOT?: InputMaybe<Array<TermsOfUseWhereInput>>;
  OR?: InputMaybe<Array<TermsOfUseWhereInput>>;
  id?: InputMaybe<IdFilter>;
};

export type TermsOfUseWhereUniqueInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type User = {
  __typename?: 'User';
  city: Scalars['String'];
  country: Scalars['String'];
  cpr: Scalars['String'];
  createdAt: Scalars['Date'];
  dateOfBirth: Scalars['Date'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  gender: Gender;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  language: Scalars['String'];
  lastName: Scalars['String'];
  mobile: Scalars['String'];
  preferences?: Maybe<UserPreferences>;
  role: UserRole;
  updatedAt: Scalars['Date'];
};

export type UserCreateInput = {
  city: Scalars['String'];
  country: Scalars['String'];
  cpr: Scalars['String'];
  dateOfBirth: Scalars['Date'];
  email: Scalars['EmailAddress'];
  firstName: Scalars['String'];
  gender: Gender;
  image?: InputMaybe<Scalars['Upload']>;
  language: Scalars['UppercaseString'];
  lastName: Scalars['String'];
  mobile: Scalars['PhoneNumber'];
  password: Scalars['Password'];
  role?: InputMaybe<UserRole>;
};

export type UserFilter = {
  email?: InputMaybe<Scalars['EmailAddress']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<UserRole>;
};

export type UserOrderByInput = {
  createdAt?: InputMaybe<OrderDirection>;
  email?: InputMaybe<OrderDirection>;
  firstName?: InputMaybe<OrderDirection>;
  id?: InputMaybe<OrderDirection>;
  lastName?: InputMaybe<OrderDirection>;
  role?: InputMaybe<OrderDirection>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  emailNotifications: Scalars['Boolean'];
  id: Scalars['ID'];
  pushNotifications: Scalars['Boolean'];
  smsNotifications: Scalars['Boolean'];
};

export type UserRole =
  | 'ADMIN'
  | 'INTERPRETER'
  | 'USER';

export type UserRoleNullableFilter = {
  equals?: InputMaybe<UserRole>;
  in?: InputMaybe<Array<UserRole>>;
  notIn?: InputMaybe<Array<UserRole>>;
};

export type UserUpdateInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  cpr?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['Date']>;
  email?: InputMaybe<Scalars['EmailAddress']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Gender>;
  image?: InputMaybe<Scalars['Upload']>;
  language?: InputMaybe<Scalars['UppercaseString']>;
  lastName?: InputMaybe<Scalars['String']>;
  mobile?: InputMaybe<Scalars['PhoneNumber']>;
  password?: InputMaybe<Scalars['Password']>;
  role?: InputMaybe<UserRole>;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  email?: InputMaybe<StringNullableFilter>;
  firstName?: InputMaybe<StringNullableFilter>;
  id?: InputMaybe<IdFilter>;
  lastName?: InputMaybe<StringNullableFilter>;
  role?: InputMaybe<UserRoleNullableFilter>;
};

export type UserWhereUniqueInput = {
  email?: InputMaybe<Scalars['EmailAddress']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type VerifyPasswordResetInput = {
  code: Scalars['OTP'];
  email: Scalars['EmailAddress'];
};

export type VerifyRegistrationInput = {
  code: Scalars['OTP'];
  email: Scalars['EmailAddress'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  About: ResolverTypeWrapper<AboutModel>;
  AboutCreateInput: AboutCreateInput;
  AboutOrderByInput: AboutOrderByInput;
  AboutUpdateInput: AboutUpdateInput;
  AboutWhereInput: AboutWhereInput;
  AboutWhereUniqueInput: AboutWhereUniqueInput;
  Advertisement: ResolverTypeWrapper<AdvertisementModel>;
  AdvertisementCreateInput: AdvertisementCreateInput;
  AdvertisementOrderByInput: AdvertisementOrderByInput;
  AdvertisementUpdateInput: AdvertisementUpdateInput;
  AdvertisementWhereInput: AdvertisementWhereInput;
  AdvertisementWhereUniqueInput: AdvertisementWhereUniqueInput;
  ArrayNullableFilter: ArrayNullableFilter;
  Authentication: ResolverTypeWrapper<Omit<Authentication, 'user'> & { user: ResolversTypes['User'] }>;
  AuthenticationResponse: ResolverTypeWrapper<Omit<AuthenticationResponse, 'authentication'> & { authentication?: Maybe<ResolversTypes['Authentication']> }>;
  BatchPayload: ResolverTypeWrapper<BatchPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Call: ResolverTypeWrapper<CallModel>;
  CallOrderByInput: CallOrderByInput;
  CallStatus: CallStatus;
  CallWhereInput: CallWhereInput;
  CallWhereUniqueInput: CallWhereUniqueInput;
  ChangePasswordInput: ChangePasswordInput;
  CheckEmailInput: CheckEmailInput;
  CompareVersionsInput: CompareVersionsInput;
  ConnectServiceInput: ConnectServiceInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  EndCallInput: EndCallInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FloatNullableFilter: FloatNullableFilter;
  FrequentlyAskedQuestion: ResolverTypeWrapper<FrequentlyAskedQuestionModel>;
  FrequentlyAskedQuestionCreateInput: FrequentlyAskedQuestionCreateInput;
  FrequentlyAskedQuestionOrderByInput: FrequentlyAskedQuestionOrderByInput;
  FrequentlyAskedQuestionUpdateInput: FrequentlyAskedQuestionUpdateInput;
  FrequentlyAskedQuestionWhereInput: FrequentlyAskedQuestionWhereInput;
  FrequentlyAskedQuestionWhereUniqueInput: FrequentlyAskedQuestionWhereUniqueInput;
  Gender: Gender;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  IDFilter: IdFilter;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IntNullableFilter: IntNullableFilter;
  Interpreter: ResolverTypeWrapper<InterpreterModel>;
  InterpreterOrderByInput: InterpreterOrderByInput;
  InterpreterRating: ResolverTypeWrapper<InterpreterRatingModel>;
  InterpreterRatingCreateInput: InterpreterRatingCreateInput;
  InterpreterRatingOption: ResolverTypeWrapper<InterpreterRatingOptionModel>;
  InterpreterRatingOptionCreateInput: InterpreterRatingOptionCreateInput;
  InterpreterRatingOptionOrderByInput: InterpreterRatingOptionOrderByInput;
  InterpreterRatingOptionUpdateInput: InterpreterRatingOptionUpdateInput;
  InterpreterRatingOptionWhereInput: InterpreterRatingOptionWhereInput;
  InterpreterRatingOptionWhereUniqueInput: InterpreterRatingOptionWhereUniqueInput;
  InterpreterRatingOrderByInput: InterpreterRatingOrderByInput;
  InterpreterRatingUpdateInput: InterpreterRatingUpdateInput;
  InterpreterRatingWhereInput: InterpreterRatingWhereInput;
  InterpreterRatingWhereUniqueInput: InterpreterRatingWhereUniqueInput;
  InterpreterStatus: InterpreterStatus;
  InterpreterUpdateInput: InterpreterUpdateInput;
  InterpreterUser: ResolverTypeWrapper<InterpreterUser>;
  InterpreterWhereInput: InterpreterWhereInput;
  InterpreterWhereUniqueInput: InterpreterWhereUniqueInput;
  KeepCallAliveData: KeepCallAliveData;
  KeepCallAliveWhereInput: KeepCallAliveWhereInput;
  LoginInput: LoginInput;
  LowercaseString: ResolverTypeWrapper<Scalars['LowercaseString']>;
  MessageResponse: ResolverTypeWrapper<MessageResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  MyInterpreterUpdateInput: MyInterpreterUpdateInput;
  MyUserDeleteInput: MyUserDeleteInput;
  MyUserPreferencesUpdateInput: MyUserPreferencesUpdateInput;
  MyUserUpdateInput: MyUserUpdateInput;
  NestedFloatNullableFilter: NestedFloatNullableFilter;
  NestedIntNullableFilter: NestedIntNullableFilter;
  NestedStringNullableFilter: NestedStringNullableFilter;
  Notification: ResolverTypeWrapper<NotificationModel>;
  NotificationCreateInput: NotificationCreateInput;
  NotificationOrderByInput: NotificationOrderByInput;
  NotificationUpdateInput: NotificationUpdateInput;
  NotificationWhereInput: NotificationWhereInput;
  NotificationWhereUniqueInput: NotificationWhereUniqueInput;
  Null: ResolverTypeWrapper<Scalars['Null']>;
  NullableID: ResolverTypeWrapper<Scalars['NullableID']>;
  NullableNumber: ResolverTypeWrapper<Scalars['NullableNumber']>;
  NullableString: ResolverTypeWrapper<Scalars['NullableString']>;
  OTP: ResolverTypeWrapper<Scalars['OTP']>;
  OrderDirection: OrderDirection;
  Password: ResolverTypeWrapper<Scalars['Password']>;
  PhoneNumber: ResolverTypeWrapper<Scalars['PhoneNumber']>;
  PrivacyPolicy: ResolverTypeWrapper<PrivacyPolicyModel>;
  PrivacyPolicyAcceptance: ResolverTypeWrapper<PrivacyPolicyAcceptanceModel>;
  PrivacyPolicyCreateInput: PrivacyPolicyCreateInput;
  PrivacyPolicyOrderByInput: PrivacyPolicyOrderByInput;
  PrivacyPolicyUpdateInput: PrivacyPolicyUpdateInput;
  PrivacyPolicyWhereInput: PrivacyPolicyWhereInput;
  PrivacyPolicyWhereUniqueInput: PrivacyPolicyWhereUniqueInput;
  Query: ResolverTypeWrapper<{}>;
  QueryMode: QueryMode;
  RegistrationInput: RegistrationInput;
  RegistrationInterpreterInput: RegistrationInterpreterInput;
  RelationshipNullableFilter: RelationshipNullableFilter;
  RequestPasswordResetInput: RequestPasswordResetInput;
  ResetPasswordInput: ResetPasswordInput;
  SendNotificationInput: SendNotificationInput;
  Service: ResolverTypeWrapper<ServiceModel>;
  ServiceCategory: ResolverTypeWrapper<ServiceCategoryModel>;
  ServiceCategoryCreateInput: ServiceCategoryCreateInput;
  ServiceCategoryOrderByInput: ServiceCategoryOrderByInput;
  ServiceCategoryUpdateInput: ServiceCategoryUpdateInput;
  ServiceCategoryWhereInput: ServiceCategoryWhereInput;
  ServiceCategoryWhereUniqueInput: ServiceCategoryWhereUniqueInput;
  ServiceCreateInput: ServiceCreateInput;
  ServiceOrderByInput: ServiceOrderByInput;
  ServiceUpdateInput: ServiceUpdateInput;
  ServiceWhereInput: ServiceWhereInput;
  ServiceWhereUniqueInput: ServiceWhereUniqueInput;
  StartCallWhereInput: StartCallWhereInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringNullableFilter: StringNullableFilter;
  SubmitExpoTokenInput: SubmitExpoTokenInput;
  TermsOfUse: ResolverTypeWrapper<TermsOfUseModel>;
  TermsOfUseAcceptance: ResolverTypeWrapper<TermsOfUseAcceptanceModel>;
  TermsOfUseCreateInput: TermsOfUseCreateInput;
  TermsOfUseOrderByInput: TermsOfUseOrderByInput;
  TermsOfUseUpdateInput: TermsOfUseUpdateInput;
  TermsOfUseWhereInput: TermsOfUseWhereInput;
  TermsOfUseWhereUniqueInput: TermsOfUseWhereUniqueInput;
  UntrimmedString: ResolverTypeWrapper<Scalars['UntrimmedString']>;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
  UppercaseString: ResolverTypeWrapper<Scalars['UppercaseString']>;
  User: ResolverTypeWrapper<UserModel>;
  UserCreateInput: UserCreateInput;
  UserFilter: UserFilter;
  UserOrderByInput: UserOrderByInput;
  UserPreferences: ResolverTypeWrapper<UserPreferencesModel>;
  UserRole: UserRole;
  UserRoleNullableFilter: UserRoleNullableFilter;
  UserUpdateInput: UserUpdateInput;
  UserWhereInput: UserWhereInput;
  UserWhereUniqueInput: UserWhereUniqueInput;
  VerifyPasswordResetInput: VerifyPasswordResetInput;
  VerifyRegistrationInput: VerifyRegistrationInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  About: AboutModel;
  AboutCreateInput: AboutCreateInput;
  AboutOrderByInput: AboutOrderByInput;
  AboutUpdateInput: AboutUpdateInput;
  AboutWhereInput: AboutWhereInput;
  AboutWhereUniqueInput: AboutWhereUniqueInput;
  Advertisement: AdvertisementModel;
  AdvertisementCreateInput: AdvertisementCreateInput;
  AdvertisementOrderByInput: AdvertisementOrderByInput;
  AdvertisementUpdateInput: AdvertisementUpdateInput;
  AdvertisementWhereInput: AdvertisementWhereInput;
  AdvertisementWhereUniqueInput: AdvertisementWhereUniqueInput;
  ArrayNullableFilter: ArrayNullableFilter;
  Authentication: Omit<Authentication, 'user'> & { user: ResolversParentTypes['User'] };
  AuthenticationResponse: Omit<AuthenticationResponse, 'authentication'> & { authentication?: Maybe<ResolversParentTypes['Authentication']> };
  BatchPayload: BatchPayload;
  Boolean: Scalars['Boolean'];
  Call: CallModel;
  CallOrderByInput: CallOrderByInput;
  CallWhereInput: CallWhereInput;
  CallWhereUniqueInput: CallWhereUniqueInput;
  ChangePasswordInput: ChangePasswordInput;
  CheckEmailInput: CheckEmailInput;
  CompareVersionsInput: CompareVersionsInput;
  ConnectServiceInput: ConnectServiceInput;
  Date: Scalars['Date'];
  EmailAddress: Scalars['EmailAddress'];
  EndCallInput: EndCallInput;
  Float: Scalars['Float'];
  FloatNullableFilter: FloatNullableFilter;
  FrequentlyAskedQuestion: FrequentlyAskedQuestionModel;
  FrequentlyAskedQuestionCreateInput: FrequentlyAskedQuestionCreateInput;
  FrequentlyAskedQuestionOrderByInput: FrequentlyAskedQuestionOrderByInput;
  FrequentlyAskedQuestionUpdateInput: FrequentlyAskedQuestionUpdateInput;
  FrequentlyAskedQuestionWhereInput: FrequentlyAskedQuestionWhereInput;
  FrequentlyAskedQuestionWhereUniqueInput: FrequentlyAskedQuestionWhereUniqueInput;
  ID: Scalars['ID'];
  IDFilter: IdFilter;
  Int: Scalars['Int'];
  IntNullableFilter: IntNullableFilter;
  Interpreter: InterpreterModel;
  InterpreterOrderByInput: InterpreterOrderByInput;
  InterpreterRating: InterpreterRatingModel;
  InterpreterRatingCreateInput: InterpreterRatingCreateInput;
  InterpreterRatingOption: InterpreterRatingOptionModel;
  InterpreterRatingOptionCreateInput: InterpreterRatingOptionCreateInput;
  InterpreterRatingOptionOrderByInput: InterpreterRatingOptionOrderByInput;
  InterpreterRatingOptionUpdateInput: InterpreterRatingOptionUpdateInput;
  InterpreterRatingOptionWhereInput: InterpreterRatingOptionWhereInput;
  InterpreterRatingOptionWhereUniqueInput: InterpreterRatingOptionWhereUniqueInput;
  InterpreterRatingOrderByInput: InterpreterRatingOrderByInput;
  InterpreterRatingUpdateInput: InterpreterRatingUpdateInput;
  InterpreterRatingWhereInput: InterpreterRatingWhereInput;
  InterpreterRatingWhereUniqueInput: InterpreterRatingWhereUniqueInput;
  InterpreterUpdateInput: InterpreterUpdateInput;
  InterpreterUser: InterpreterUser;
  InterpreterWhereInput: InterpreterWhereInput;
  InterpreterWhereUniqueInput: InterpreterWhereUniqueInput;
  KeepCallAliveData: KeepCallAliveData;
  KeepCallAliveWhereInput: KeepCallAliveWhereInput;
  LoginInput: LoginInput;
  LowercaseString: Scalars['LowercaseString'];
  MessageResponse: MessageResponse;
  Mutation: {};
  MyInterpreterUpdateInput: MyInterpreterUpdateInput;
  MyUserDeleteInput: MyUserDeleteInput;
  MyUserPreferencesUpdateInput: MyUserPreferencesUpdateInput;
  MyUserUpdateInput: MyUserUpdateInput;
  NestedFloatNullableFilter: NestedFloatNullableFilter;
  NestedIntNullableFilter: NestedIntNullableFilter;
  NestedStringNullableFilter: NestedStringNullableFilter;
  Notification: NotificationModel;
  NotificationCreateInput: NotificationCreateInput;
  NotificationOrderByInput: NotificationOrderByInput;
  NotificationUpdateInput: NotificationUpdateInput;
  NotificationWhereInput: NotificationWhereInput;
  NotificationWhereUniqueInput: NotificationWhereUniqueInput;
  Null: Scalars['Null'];
  NullableID: Scalars['NullableID'];
  NullableNumber: Scalars['NullableNumber'];
  NullableString: Scalars['NullableString'];
  OTP: Scalars['OTP'];
  Password: Scalars['Password'];
  PhoneNumber: Scalars['PhoneNumber'];
  PrivacyPolicy: PrivacyPolicyModel;
  PrivacyPolicyAcceptance: PrivacyPolicyAcceptanceModel;
  PrivacyPolicyCreateInput: PrivacyPolicyCreateInput;
  PrivacyPolicyOrderByInput: PrivacyPolicyOrderByInput;
  PrivacyPolicyUpdateInput: PrivacyPolicyUpdateInput;
  PrivacyPolicyWhereInput: PrivacyPolicyWhereInput;
  PrivacyPolicyWhereUniqueInput: PrivacyPolicyWhereUniqueInput;
  Query: {};
  RegistrationInput: RegistrationInput;
  RegistrationInterpreterInput: RegistrationInterpreterInput;
  RelationshipNullableFilter: RelationshipNullableFilter;
  RequestPasswordResetInput: RequestPasswordResetInput;
  ResetPasswordInput: ResetPasswordInput;
  SendNotificationInput: SendNotificationInput;
  Service: ServiceModel;
  ServiceCategory: ServiceCategoryModel;
  ServiceCategoryCreateInput: ServiceCategoryCreateInput;
  ServiceCategoryOrderByInput: ServiceCategoryOrderByInput;
  ServiceCategoryUpdateInput: ServiceCategoryUpdateInput;
  ServiceCategoryWhereInput: ServiceCategoryWhereInput;
  ServiceCategoryWhereUniqueInput: ServiceCategoryWhereUniqueInput;
  ServiceCreateInput: ServiceCreateInput;
  ServiceOrderByInput: ServiceOrderByInput;
  ServiceUpdateInput: ServiceUpdateInput;
  ServiceWhereInput: ServiceWhereInput;
  ServiceWhereUniqueInput: ServiceWhereUniqueInput;
  StartCallWhereInput: StartCallWhereInput;
  String: Scalars['String'];
  StringNullableFilter: StringNullableFilter;
  SubmitExpoTokenInput: SubmitExpoTokenInput;
  TermsOfUse: TermsOfUseModel;
  TermsOfUseAcceptance: TermsOfUseAcceptanceModel;
  TermsOfUseCreateInput: TermsOfUseCreateInput;
  TermsOfUseOrderByInput: TermsOfUseOrderByInput;
  TermsOfUseUpdateInput: TermsOfUseUpdateInput;
  TermsOfUseWhereInput: TermsOfUseWhereInput;
  TermsOfUseWhereUniqueInput: TermsOfUseWhereUniqueInput;
  UntrimmedString: Scalars['UntrimmedString'];
  Upload: Scalars['Upload'];
  UppercaseString: Scalars['UppercaseString'];
  User: UserModel;
  UserCreateInput: UserCreateInput;
  UserFilter: UserFilter;
  UserOrderByInput: UserOrderByInput;
  UserPreferences: UserPreferencesModel;
  UserRoleNullableFilter: UserRoleNullableFilter;
  UserUpdateInput: UserUpdateInput;
  UserWhereInput: UserWhereInput;
  UserWhereUniqueInput: UserWhereUniqueInput;
  VerifyPasswordResetInput: VerifyPasswordResetInput;
  VerifyRegistrationInput: VerifyRegistrationInput;
};

export type AboutResolvers<ContextType = Context, ParentType extends ResolversParentTypes['About'] = ResolversParentTypes['About']> = {
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AdvertisementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Advertisement'] = ResolversParentTypes['Advertisement']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titleAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  titleEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  views?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Authentication'] = ResolversParentTypes['Authentication']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthenticationResponse'] = ResolversParentTypes['AuthenticationResponse']> = {
  authentication?: Resolver<Maybe<ResolversTypes['Authentication']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BatchPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BatchPayload'] = ResolversParentTypes['BatchPayload']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CallResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Call'] = ResolversParentTypes['Call']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  serviceCalledAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  serviceEndedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  startedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['CallStatus'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type FrequentlyAskedQuestionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FrequentlyAskedQuestion'] = ResolversParentTypes['FrequentlyAskedQuestion']> = {
  answer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  answerAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  answerEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  questionAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InterpreterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Interpreter'] = ResolversParentTypes['Interpreter']> = {
  approved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isBusy?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isFavorite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  languages?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  online?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  rating?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ratings?: Resolver<Array<ResolversTypes['InterpreterRating']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InterpreterStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['InterpreterUser'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InterpreterRatingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InterpreterRating'] = ResolversParentTypes['InterpreterRating']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType>;
  ip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['InterpreterRatingOption']>, ParentType, ContextType>;
  rating?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tellUsMore?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InterpreterRatingOptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InterpreterRatingOption'] = ResolversParentTypes['InterpreterRatingOption']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ratingVisibleFrom?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  ratingVisibleTo?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  ratings?: Resolver<Array<ResolversTypes['InterpreterRating']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titleAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  titleEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InterpreterUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InterpreterUser'] = ResolversParentTypes['InterpreterUser']> = {
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fullName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface LowercaseStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LowercaseString'], any> {
  name: 'LowercaseString';
}

export type MessageResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageResponse'] = ResolversParentTypes['MessageResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  acceptPrivacyPolicy?: Resolver<ResolversTypes['PrivacyPolicyAcceptance'], ParentType, ContextType, RequireFields<MutationAcceptPrivacyPolicyArgs, 'where'>>;
  acceptTermsOfUse?: Resolver<ResolversTypes['TermsOfUseAcceptance'], ParentType, ContextType, RequireFields<MutationAcceptTermsOfUseArgs, 'where'>>;
  activateAdvertisement?: Resolver<ResolversTypes['Advertisement'], ParentType, ContextType, RequireFields<MutationActivateAdvertisementArgs, 'where'>>;
  activeCall?: Resolver<Maybe<ResolversTypes['Call']>, ParentType, ContextType>;
  answerCall?: Resolver<ResolversTypes['Call'], ParentType, ContextType>;
  approveInterpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType, RequireFields<MutationApproveInterpreterArgs, 'where'>>;
  changePassword?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'data'>>;
  connectService?: Resolver<ResolversTypes['Call'], ParentType, ContextType, RequireFields<MutationConnectServiceArgs, 'data'>>;
  createAbout?: Resolver<ResolversTypes['About'], ParentType, ContextType, RequireFields<MutationCreateAboutArgs, 'data'>>;
  createAdvertisement?: Resolver<ResolversTypes['Advertisement'], ParentType, ContextType, RequireFields<MutationCreateAdvertisementArgs, 'data'>>;
  createFrequentlyAskedQuestion?: Resolver<ResolversTypes['FrequentlyAskedQuestion'], ParentType, ContextType, RequireFields<MutationCreateFrequentlyAskedQuestionArgs, 'data'>>;
  createInterpreterRating?: Resolver<ResolversTypes['InterpreterRating'], ParentType, ContextType, RequireFields<MutationCreateInterpreterRatingArgs, 'data'>>;
  createInterpreterRatingOption?: Resolver<ResolversTypes['InterpreterRatingOption'], ParentType, ContextType, RequireFields<MutationCreateInterpreterRatingOptionArgs, 'data'>>;
  createNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationCreateNotificationArgs, 'data'>>;
  createPrivacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType, RequireFields<MutationCreatePrivacyPolicyArgs, 'data'>>;
  createService?: Resolver<ResolversTypes['Service'], ParentType, ContextType, RequireFields<MutationCreateServiceArgs, 'data'>>;
  createServiceCategory?: Resolver<ResolversTypes['ServiceCategory'], ParentType, ContextType, RequireFields<MutationCreateServiceCategoryArgs, 'data'>>;
  createTermsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType, RequireFields<MutationCreateTermsOfUseArgs, 'data'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'data'>>;
  deleteAbout?: Resolver<ResolversTypes['About'], ParentType, ContextType, RequireFields<MutationDeleteAboutArgs, 'where'>>;
  deleteAdvertisement?: Resolver<ResolversTypes['Advertisement'], ParentType, ContextType, RequireFields<MutationDeleteAdvertisementArgs, 'where'>>;
  deleteFrequentlyAskedQuestion?: Resolver<ResolversTypes['FrequentlyAskedQuestion'], ParentType, ContextType, RequireFields<MutationDeleteFrequentlyAskedQuestionArgs, 'where'>>;
  deleteInterpreterRating?: Resolver<ResolversTypes['InterpreterRating'], ParentType, ContextType, RequireFields<MutationDeleteInterpreterRatingArgs, 'where'>>;
  deleteInterpreterRatingOption?: Resolver<ResolversTypes['InterpreterRatingOption'], ParentType, ContextType, RequireFields<MutationDeleteInterpreterRatingOptionArgs, 'where'>>;
  deleteMyUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationDeleteMyUserArgs, 'data'>>;
  deleteNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationDeleteNotificationArgs, 'where'>>;
  deletePrivacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType, RequireFields<MutationDeletePrivacyPolicyArgs, 'where'>>;
  deleteService?: Resolver<ResolversTypes['Service'], ParentType, ContextType, RequireFields<MutationDeleteServiceArgs, 'where'>>;
  deleteServiceCategory?: Resolver<ResolversTypes['ServiceCategory'], ParentType, ContextType, RequireFields<MutationDeleteServiceCategoryArgs, 'where'>>;
  deleteTermsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType, RequireFields<MutationDeleteTermsOfUseArgs, 'where'>>;
  deleteUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'where'>>;
  disconnectService?: Resolver<ResolversTypes['Call'], ParentType, ContextType>;
  endCall?: Resolver<ResolversTypes['Call'], ParentType, ContextType>;
  keepCallAlive?: Resolver<ResolversTypes['Call'], ParentType, ContextType, RequireFields<MutationKeepCallAliveArgs, 'data' | 'where'>>;
  register?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'data'>>;
  rejectCall?: Resolver<ResolversTypes['Call'], ParentType, ContextType>;
  rejectInterpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType, RequireFields<MutationRejectInterpreterArgs, 'where'>>;
  requestPasswordReset?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationRequestPasswordResetArgs, 'data'>>;
  resetPassword?: Resolver<ResolversTypes['AuthenticationResponse'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'data'>>;
  sendNotification?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationSendNotificationArgs, 'data'>>;
  startCall?: Resolver<ResolversTypes['Call'], ParentType, ContextType, RequireFields<MutationStartCallArgs, 'where'>>;
  submitExpoToken?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationSubmitExpoTokenArgs, 'data'>>;
  toggleFavoriteInterpreter?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationToggleFavoriteInterpreterArgs, 'where'>>;
  toggleInterpreterAvailability?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  toggleMaintenanceMode?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType>;
  updateAbout?: Resolver<ResolversTypes['About'], ParentType, ContextType, RequireFields<MutationUpdateAboutArgs, 'data' | 'where'>>;
  updateAdvertisement?: Resolver<ResolversTypes['Advertisement'], ParentType, ContextType, RequireFields<MutationUpdateAdvertisementArgs, 'data' | 'where'>>;
  updateFrequentlyAskedQuestion?: Resolver<ResolversTypes['FrequentlyAskedQuestion'], ParentType, ContextType, RequireFields<MutationUpdateFrequentlyAskedQuestionArgs, 'data' | 'where'>>;
  updateInterpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType, RequireFields<MutationUpdateInterpreterArgs, 'data' | 'where'>>;
  updateInterpreterRating?: Resolver<ResolversTypes['InterpreterRating'], ParentType, ContextType, RequireFields<MutationUpdateInterpreterRatingArgs, 'data' | 'where'>>;
  updateInterpreterRatingOption?: Resolver<ResolversTypes['InterpreterRatingOption'], ParentType, ContextType, RequireFields<MutationUpdateInterpreterRatingOptionArgs, 'data' | 'where'>>;
  updateMyInterpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType, RequireFields<MutationUpdateMyInterpreterArgs, 'data'>>;
  updateMyPreferences?: Resolver<ResolversTypes['UserPreferences'], ParentType, ContextType, RequireFields<MutationUpdateMyPreferencesArgs, 'data'>>;
  updateMyUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateMyUserArgs, 'data'>>;
  updateNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationUpdateNotificationArgs, 'data' | 'where'>>;
  updatePrivacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType, RequireFields<MutationUpdatePrivacyPolicyArgs, 'data' | 'where'>>;
  updateService?: Resolver<ResolversTypes['Service'], ParentType, ContextType, RequireFields<MutationUpdateServiceArgs, 'data' | 'where'>>;
  updateServiceCategory?: Resolver<ResolversTypes['ServiceCategory'], ParentType, ContextType, RequireFields<MutationUpdateServiceCategoryArgs, 'data' | 'where'>>;
  updateTermsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType, RequireFields<MutationUpdateTermsOfUseArgs, 'data' | 'where'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'data' | 'where'>>;
  verifyPasswordReset?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<MutationVerifyPasswordResetArgs, 'data'>>;
  verifyRegistration?: Resolver<ResolversTypes['AuthenticationResponse'], ParentType, ContextType, RequireFields<MutationVerifyRegistrationArgs, 'data'>>;
};

export type NotificationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messageAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  messageEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titleAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  titleEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface NullScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Null'], any> {
  name: 'Null';
}

export interface NullableIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullableID'], any> {
  name: 'NullableID';
}

export interface NullableNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullableNumber'], any> {
  name: 'NullableNumber';
}

export interface NullableStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullableString'], any> {
  name: 'NullableString';
}

export interface OtpScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['OTP'], any> {
  name: 'OTP';
}

export interface PasswordScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Password'], any> {
  name: 'Password';
}

export interface PhoneNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PhoneNumber'], any> {
  name: 'PhoneNumber';
}

export type PrivacyPolicyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PrivacyPolicy'] = ResolversParentTypes['PrivacyPolicy']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PrivacyPolicyAcceptanceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PrivacyPolicyAcceptance'] = ResolversParentTypes['PrivacyPolicyAcceptance']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  privacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  about?: Resolver<ResolversTypes['About'], ParentType, ContextType, RequireFields<QueryAboutArgs, 'where'>>;
  abouts?: Resolver<Array<ResolversTypes['About']>, ParentType, ContextType, RequireFields<QueryAboutsArgs, 'skip' | 'take' | 'where'>>;
  aboutsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryAboutsCountArgs, 'where'>>;
  activeAdvertisements?: Resolver<Array<ResolversTypes['Advertisement']>, ParentType, ContextType>;
  advertisement?: Resolver<Maybe<ResolversTypes['Advertisement']>, ParentType, ContextType, RequireFields<QueryAdvertisementArgs, 'where'>>;
  advertisements?: Resolver<Array<ResolversTypes['Advertisement']>, ParentType, ContextType, RequireFields<QueryAdvertisementsArgs, 'skip' | 'take' | 'where'>>;
  advertisementsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryAdvertisementsCountArgs, 'where'>>;
  call?: Resolver<ResolversTypes['Call'], ParentType, ContextType, RequireFields<QueryCallArgs, 'where'>>;
  calls?: Resolver<Array<ResolversTypes['Call']>, ParentType, ContextType, RequireFields<QueryCallsArgs, 'skip' | 'take' | 'where'>>;
  callsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryCallsCountArgs, 'where'>>;
  compareVersions?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType, RequireFields<QueryCompareVersionsArgs, 'data'>>;
  frequentlyAskedQuestion?: Resolver<ResolversTypes['FrequentlyAskedQuestion'], ParentType, ContextType, RequireFields<QueryFrequentlyAskedQuestionArgs, 'where'>>;
  frequentlyAskedQuestions?: Resolver<Array<ResolversTypes['FrequentlyAskedQuestion']>, ParentType, ContextType, RequireFields<QueryFrequentlyAskedQuestionsArgs, 'skip' | 'take' | 'where'>>;
  frequentlyAskedQuestionsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryFrequentlyAskedQuestionsCountArgs, 'where'>>;
  interpreter?: Resolver<ResolversTypes['Interpreter'], ParentType, ContextType, RequireFields<QueryInterpreterArgs, 'where'>>;
  interpreterRating?: Resolver<ResolversTypes['InterpreterRating'], ParentType, ContextType, RequireFields<QueryInterpreterRatingArgs, 'where'>>;
  interpreterRatingOption?: Resolver<ResolversTypes['InterpreterRatingOption'], ParentType, ContextType, RequireFields<QueryInterpreterRatingOptionArgs, 'where'>>;
  interpreterRatingOptions?: Resolver<Array<ResolversTypes['InterpreterRatingOption']>, ParentType, ContextType, RequireFields<QueryInterpreterRatingOptionsArgs, 'skip' | 'take' | 'where'>>;
  interpreterRatingOptionsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryInterpreterRatingOptionsCountArgs, 'where'>>;
  interpreterRatings?: Resolver<Array<ResolversTypes['InterpreterRating']>, ParentType, ContextType, RequireFields<QueryInterpreterRatingsArgs, 'skip' | 'take' | 'where'>>;
  interpreterRatingsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryInterpreterRatingsCountArgs, 'where'>>;
  interpreters?: Resolver<Array<ResolversTypes['Interpreter']>, ParentType, ContextType, RequireFields<QueryInterpretersArgs, 'skip' | 'take' | 'where'>>;
  interpretersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryInterpretersCountArgs, 'where'>>;
  latestAbout?: Resolver<ResolversTypes['About'], ParentType, ContextType>;
  latestPrivacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType>;
  latestTermsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType>;
  login?: Resolver<ResolversTypes['AuthenticationResponse'], ParentType, ContextType, RequireFields<QueryLoginArgs, 'data'>>;
  maintenanceMode?: Resolver<ResolversTypes['MessageResponse'], ParentType, ContextType>;
  myAvailability?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  myNotifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<QueryMyNotificationsArgs, 'skip' | 'take' | 'where'>>;
  myNotificationsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryMyNotificationsCountArgs, 'where'>>;
  myPreferences?: Resolver<ResolversTypes['UserPreferences'], ParentType, ContextType>;
  myUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  notification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<QueryNotificationArgs, 'where'>>;
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<QueryNotificationsArgs, 'skip' | 'take' | 'where'>>;
  notificationsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryNotificationsCountArgs, 'where'>>;
  outboundNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  privacyPolicies?: Resolver<Array<ResolversTypes['PrivacyPolicy']>, ParentType, ContextType, RequireFields<QueryPrivacyPoliciesArgs, 'skip' | 'take' | 'where'>>;
  privacyPoliciesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryPrivacyPoliciesCountArgs, 'where'>>;
  privacyPolicy?: Resolver<ResolversTypes['PrivacyPolicy'], ParentType, ContextType, RequireFields<QueryPrivacyPolicyArgs, 'where'>>;
  service?: Resolver<ResolversTypes['Service'], ParentType, ContextType, RequireFields<QueryServiceArgs, 'where'>>;
  serviceCategories?: Resolver<Array<ResolversTypes['ServiceCategory']>, ParentType, ContextType, RequireFields<QueryServiceCategoriesArgs, 'skip' | 'take' | 'where'>>;
  serviceCategoriesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryServiceCategoriesCountArgs, 'where'>>;
  serviceCategory?: Resolver<ResolversTypes['ServiceCategory'], ParentType, ContextType, RequireFields<QueryServiceCategoryArgs, 'where'>>;
  services?: Resolver<Array<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<QueryServicesArgs, 'skip' | 'take' | 'where'>>;
  servicesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryServicesCountArgs, 'where'>>;
  termsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType, RequireFields<QueryTermsOfUseArgs, 'where'>>;
  termsOfUses?: Resolver<Array<ResolversTypes['TermsOfUse']>, ParentType, ContextType, RequireFields<QueryTermsOfUsesArgs, 'skip' | 'take' | 'where'>>;
  termsOfUsesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryTermsOfUsesCountArgs, 'where'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'where'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'skip' | 'take' | 'where'>>;
  usersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryUsersCountArgs, 'where'>>;
};

export type ServiceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Service'] = ResolversParentTypes['Service']> = {
  category?: Resolver<Maybe<ResolversTypes['ServiceCategory']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  descriptionAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  descriptionEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nameAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nameEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ServiceCategory'] = ResolversParentTypes['ServiceCategory']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  services?: Resolver<Maybe<Array<ResolversTypes['Service']>>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titleAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  titleEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TermsOfUseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TermsOfUse'] = ResolversParentTypes['TermsOfUse']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentAr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TermsOfUseAcceptanceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TermsOfUseAcceptance'] = ResolversParentTypes['TermsOfUseAcceptance']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  termsOfUse?: Resolver<ResolversTypes['TermsOfUse'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UntrimmedStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UntrimmedString'], any> {
  name: 'UntrimmedString';
}

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export interface UppercaseStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UppercaseString'], any> {
  name: 'UppercaseString';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cpr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['Gender'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mobile?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preferences?: Resolver<Maybe<ResolversTypes['UserPreferences']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserPreferencesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserPreferences'] = ResolversParentTypes['UserPreferences']> = {
  emailNotifications?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pushNotifications?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  smsNotifications?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  About?: AboutResolvers<ContextType>;
  Advertisement?: AdvertisementResolvers<ContextType>;
  Authentication?: AuthenticationResolvers<ContextType>;
  AuthenticationResponse?: AuthenticationResponseResolvers<ContextType>;
  BatchPayload?: BatchPayloadResolvers<ContextType>;
  Call?: CallResolvers<ContextType>;
  Date?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  FrequentlyAskedQuestion?: FrequentlyAskedQuestionResolvers<ContextType>;
  Interpreter?: InterpreterResolvers<ContextType>;
  InterpreterRating?: InterpreterRatingResolvers<ContextType>;
  InterpreterRatingOption?: InterpreterRatingOptionResolvers<ContextType>;
  InterpreterUser?: InterpreterUserResolvers<ContextType>;
  LowercaseString?: GraphQLScalarType;
  MessageResponse?: MessageResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  Null?: GraphQLScalarType;
  NullableID?: GraphQLScalarType;
  NullableNumber?: GraphQLScalarType;
  NullableString?: GraphQLScalarType;
  OTP?: GraphQLScalarType;
  Password?: GraphQLScalarType;
  PhoneNumber?: GraphQLScalarType;
  PrivacyPolicy?: PrivacyPolicyResolvers<ContextType>;
  PrivacyPolicyAcceptance?: PrivacyPolicyAcceptanceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Service?: ServiceResolvers<ContextType>;
  ServiceCategory?: ServiceCategoryResolvers<ContextType>;
  TermsOfUse?: TermsOfUseResolvers<ContextType>;
  TermsOfUseAcceptance?: TermsOfUseAcceptanceResolvers<ContextType>;
  UntrimmedString?: GraphQLScalarType;
  Upload?: GraphQLScalarType;
  UppercaseString?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserPreferences?: UserPreferencesResolvers<ContextType>;
};

