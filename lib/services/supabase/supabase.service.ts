import 'server-only';
import {getSupabaseAdmin} from '@/lib/auth';


import { SupabaseClient } from '@supabase/supabase-js';


export class SupabaseService  {
  private client: SupabaseClient;



  private initialize() { this.client = getSupabaseAdmin(); }

  getClient(): SupabaseClient {
    if (!this.client) this.initialize();
    return this.client;
  }

  async getUserById(id: string) {
    const { data, error } = await this.getClient()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.getClient()
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async createUser(userData: any) {
    const { data, error } = await this.getClient()
      .from('profiles')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: any) {
    const { data, error } = await this.getClient()
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUsers() {
    const { data, error } = await this.getClient()
      .from('profiles')
      .select('*');

    if (error) throw error;
    return data;
  }
}