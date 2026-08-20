import {categoryDto} from './categories.dto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createCategory(data: categoryDto) 
{
  const newCategory = await prisma.category.create
    (
      {
        data:
        {
          name: data.name
        }
    }
  )
  return newCategory;
};

export async function getAllCategories()
{
  return await prisma.category.findMany();
}

export async function getCategoryById(id: string)
{
  return await prisma.category.findUnique({ where: { id }, include: { equipment: true } }); // pokazuje z należącym sprzętem
}

export async function updateCategory(id: string, data: categoryDto)
{
  return await prisma.category.update({ where: { id }, data: { name: data.name } });
}

export async function deleteCategory(id: string)
{
  return await prisma.category.delete({ where: { id } });
}