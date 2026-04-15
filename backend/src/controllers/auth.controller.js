import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";


export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.registerUser({ email, password, name });
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: authService.toPublicUser(req.user) });
});
