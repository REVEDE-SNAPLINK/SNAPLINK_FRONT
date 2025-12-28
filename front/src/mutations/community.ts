import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCommunityPost,
  updatePost,
  deletePost,
  toggleLike,
  createComment,
  updateComment,
  deleteComment,
} from '@/api/community.ts';
import { communityKeys } from '@/queries/keys.ts';

export const useCreateCommunityPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useCreateCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId: number }) =>
      createComment(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) });
    },
  });
};

export const useUpdateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};