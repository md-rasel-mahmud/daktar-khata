import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { collectionsName } from "../../constant";
import { Blog, BlogDocument } from "./schema/blog.schema";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(collectionsName.blog)
    private readonly blogModel: Model<BlogDocument>,
  ) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async create(createBlogDto: CreateBlogDto, user?: any): Promise<Blog> {
    let slug = createBlogDto.slug
      ? this.slugify(createBlogDto.slug)
      : this.slugify(createBlogDto.title);

    if (!slug) {
      slug = `post-${Date.now()}`;
    }

    // Ensure unique slug
    const existing = await this.blogModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = new this.blogModel({
      ...createBlogDto,
      slug,
      author: user?.id ? new Types.ObjectId(user.id) : undefined,
      authorName: createBlogDto.authorName || user?.profile?.name || user?.name || "Admin",
      isPublished: createBlogDto.isPublished !== undefined ? createBlogDto.isPublished : true,
    });

    return blog.save();
  }

  async findAll(publishedOnly = false, limit = 20): Promise<Blog[]> {
    const filter: any = {};
    if (publishedOnly) {
      filter.isPublished = true;
    }
    return this.blogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findBySlugOrId(identifier: string): Promise<Blog> {
    let blog: BlogDocument | null = null;
    if (Types.ObjectId.isValid(identifier)) {
      blog = await this.blogModel.findById(identifier).exec();
    }
    if (!blog) {
      blog = await this.blogModel.findOne({ slug: identifier }).exec();
    }
    if (!blog) {
      throw new NotFoundException("Blog post not found");
    }

    // Increment views
    await this.blogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const existing = await this.blogModel.findById(id);
    if (!existing) {
      throw new NotFoundException("Blog post not found");
    }

    const payload: any = { ...updateBlogDto };
    if (updateBlogDto.title && !updateBlogDto.slug) {
      // update slug optionally or keep existing
    } else if (updateBlogDto.slug) {
      payload.slug = this.slugify(updateBlogDto.slug);
    }

    const updated = await this.blogModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.blogModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException("Blog post not found");
    }
    return { message: "Blog post removed successfully" };
  }
}
