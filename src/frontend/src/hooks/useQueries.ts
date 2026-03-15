import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GameType } from "../backend.d";
import { useActor } from "./useActor";

export { GameType };

export function useGetFunFacts() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["funFacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFunFacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopScores(gameType: GameType) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topScores", gameType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores(gameType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerName,
      scoreValue,
      gameType,
    }: {
      playerName: string;
      scoreValue: bigint;
      gameType: GameType;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addScore(playerName, scoreValue, gameType);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topScores", variables.gameType],
      });
    },
  });
}
