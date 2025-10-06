import { Schema } from "effect";

// Database type schemas
export const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  sessionId: Schema.String,
  createdAt: Schema.Union(Schema.DateFromSelf, Schema.Date),
});

export const SummerHouseSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  imageUrl: Schema.String,
  bookingUrl: Schema.String,
  createdAt: Schema.Union(Schema.DateFromSelf, Schema.Date),
});

export const VoteSchema = Schema.Struct({
  id: Schema.Number,
  userId: Schema.Number,
  summerHouseId: Schema.Number,
  createdAt: Schema.Union(Schema.DateFromSelf, Schema.Date),
});

// Extended schemas for API responses
export const VoteWithTimestampSchema = Schema.Struct({
  summerHouseId: Schema.Number,
  createdAt: Schema.Union(Schema.DateFromSelf, Schema.Date),
});

export const UserWithVotesSchema = Schema.Struct({
  ...UserSchema.fields,
  votes: Schema.Array(VoteWithTimestampSchema),
});

export const SummerHouseWithVoteCountSchema = Schema.Struct({
  ...SummerHouseSchema.fields,
  voteCount: Schema.Number,
});

// API Request schemas
export const CreateUserRequestSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.nonEmptyString()),
  email: Schema.String.pipe(Schema.nonEmptyString()),
});

export const LoginRequestSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.nonEmptyString()),
});

export const CheckUserRequestSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.nonEmptyString()),
});

export const VoteRequestSchema = Schema.Struct({
  summerHouseId: Schema.Number,
});

export const DeleteVoteRequestSchema = Schema.Struct({
  summerHouseId: Schema.Number,
});

// API Response schemas
export const CreateUserResponseSchema = Schema.Struct({
  user: UserWithVotesSchema,
});

export const LoginResponseSchema = Schema.Struct({
  user: UserWithVotesSchema,
});

export const CheckUserResponseSchema = Schema.Struct({
  exists: Schema.Boolean,
});

export const GetUserResponseSchema = Schema.Struct({
  user: Schema.Union(UserWithVotesSchema, Schema.Literal(null)),
});

export const GetSummerHousesResponseSchema = Schema.Struct({
  summerHouses: Schema.Array(SummerHouseSchema),
});

export const VoteResponseSchema = Schema.Struct({
  vote: VoteSchema,
  user: UserWithVotesSchema,
});

export const DeleteVoteResponseSchema = Schema.Struct({
  success: Schema.Boolean,
  user: UserWithVotesSchema,
});

export const GetResultsResponseSchema = Schema.Struct({
  results: Schema.Array(SummerHouseWithVoteCountSchema),
});
